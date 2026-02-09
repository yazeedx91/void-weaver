import { Router, Response } from "express";
import rateLimit from "express-rate-limit";
import crypto from "crypto";
import { z } from "zod";
import { db } from "../db.js";
import { teams, userResults, users } from "../../shared/schema.js";
import { eq, and, count, sql, inArray } from "drizzle-orm";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.js";
import { decrypt } from "../lib/encryption.js";

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim();
}

const createTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters").max(100, "Team name too long").transform(stripHtml),
  description: z.string().max(500).optional().transform(val => val ? stripHtml(val) : val),
});

const teamCodeParamSchema = z.object({
  code: z.string().regex(/^FX-[A-Z0-9]{8}$/, "Invalid team code format"),
});

const router = Router();

const teamLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

function generateTeamCode(): string {
  return 'FX-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

router.post("/create", requireAuth, teamLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validation = createTeamSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const { name, description } = validation.data;
    const code = generateTeamCode();
    const [team] = await db.insert(teams).values({
      code,
      name,
      leaderUserId: req.user!.id,
      description: description || null,
    }).returning();

    res.json({ success: true, team: { id: team.id, code: team.code, name: team.name } });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error("Team create error:", error instanceof Error ? error.message : "Unknown");
    res.status(500).json({ error: "Failed to create team" });
  }
});

router.get("/my-teams", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const ledTeams = await db.select().from(teams).where(eq(teams.leaderUserId, userId));

    const memberTeamCodes = await db.selectDistinct({ teamCode: userResults.teamCode })
      .from(userResults)
      .where(and(eq(userResults.userId, userId), sql`${userResults.teamCode} IS NOT NULL`));

    const memberCodes = memberTeamCodes.map(r => r.teamCode).filter(Boolean) as string[];
    let memberTeams: typeof ledTeams = [];
    if (memberCodes.length > 0) {
      memberTeams = await db.select().from(teams).where(inArray(teams.code, memberCodes));
    }

    const allTeams = [...ledTeams, ...memberTeams.filter(t => !ledTeams.some(lt => lt.id === t.id))];

    const teamsWithCounts = await Promise.all(allTeams.map(async (team) => {
      const [memberCount] = await db.select({ count: count() })
        .from(userResults)
        .where(sql`${userResults.teamCode} = ${team.code}`);

      const uniqueMembers = await db.selectDistinct({ userId: userResults.userId })
        .from(userResults)
        .where(sql`${userResults.teamCode} = ${team.code}`);

      return {
        ...team,
        memberCount: uniqueMembers.length,
        assessmentCount: memberCount.count,
        isLeader: team.leaderUserId === userId,
      };
    }));

    res.json({ teams: teamsWithCounts });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error("My teams error:", error instanceof Error ? error.message : "Unknown");
    res.status(500).json({ error: "Failed to fetch teams" });
  }
});

router.get("/report/:code", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const paramValidation = teamCodeParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({ error: "Invalid team code format" });
    }
    const { code } = paramValidation.data;
    const [team] = await db.select().from(teams).where(sql`${teams.code} = ${code}`);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const teamResults = await db.select({
      id: userResults.id,
      userId: userResults.userId,
      dassDepressionEncrypted: userResults.dassDepressionEncrypted,
      dassAnxietyEncrypted: userResults.dassAnxietyEncrypted,
      dassStressEncrypted: userResults.dassStressEncrypted,
      hexacoScores: userResults.hexacoScores,
      completedAt: userResults.completedAt,
    }).from(userResults).where(sql`${userResults.teamCode} = ${code}`);

    const uniqueUserIds = [...new Set(teamResults.map(r => r.userId))];

    if (uniqueUserIds.length < 5) {
      return res.json({
        team: { name: team.name, code: team.code },
        ready: false,
        currentMembers: uniqueUserIds.length,
        requiredMembers: 5,
        message: `${5 - uniqueUserIds.length} more team member(s) needed to unlock the Team Dynamic Range report.`,
      });
    }

    const aggregated = {
      depression: { sum: 0, count: 0 },
      anxiety: { sum: 0, count: 0 },
      stress: { sum: 0, count: 0 },
      hexaco: {
        HonestyHumility: { sum: 0, count: 0 },
        Emotionality: { sum: 0, count: 0 },
        Extraversion: { sum: 0, count: 0 },
        Agreeableness: { sum: 0, count: 0 },
        Conscientiousness: { sum: 0, count: 0 },
        OpennessToExperience: { sum: 0, count: 0 },
      },
    };

    for (const result of teamResults) {
      try {
        const dep = parseInt(decrypt(result.dassDepressionEncrypted, result.userId));
        const anx = parseInt(decrypt(result.dassAnxietyEncrypted, result.userId));
        const str = parseInt(decrypt(result.dassStressEncrypted, result.userId));
        aggregated.depression.sum += dep;
        aggregated.depression.count++;
        aggregated.anxiety.sum += anx;
        aggregated.anxiety.count++;
        aggregated.stress.sum += str;
        aggregated.stress.count++;

        if (result.hexacoScores) {
          try {
            const hexaco = JSON.parse(decrypt(result.hexacoScores, result.userId));
            for (const key of Object.keys(aggregated.hexaco) as (keyof typeof aggregated.hexaco)[]) {
              if (hexaco[key] != null) {
                aggregated.hexaco[key].sum += hexaco[key];
                aggregated.hexaco[key].count++;
              }
            }
          } catch {}
        }
      } catch {}
    }

    const avg = (obj: { sum: number; count: number }) => obj.count > 0 ? Number((obj.sum / obj.count).toFixed(2)) : 0;

    const teamProfile = {
      dassAverages: {
        Depression: avg(aggregated.depression),
        Anxiety: avg(aggregated.anxiety),
        Stress: avg(aggregated.stress),
      },
      hexacoAverages: {
        HonestyHumility: avg(aggregated.hexaco.HonestyHumility),
        Emotionality: avg(aggregated.hexaco.Emotionality),
        Extraversion: avg(aggregated.hexaco.Extraversion),
        Agreeableness: avg(aggregated.hexaco.Agreeableness),
        Conscientiousness: avg(aggregated.hexaco.Conscientiousness),
        OpennessToExperience: avg(aggregated.hexaco.OpennessToExperience),
      },
    };

    const hexacoValues = Object.values(teamProfile.hexacoAverages);
    const maxTrait = Object.keys(teamProfile.hexacoAverages)[hexacoValues.indexOf(Math.max(...hexacoValues))];
    const minTrait = Object.keys(teamProfile.hexacoAverages)[hexacoValues.indexOf(Math.min(...hexacoValues))];

    const dynamicRange = Math.max(...hexacoValues) - Math.min(...hexacoValues);
    const cohesionScore = Number((100 - (dynamicRange / 4) * 100).toFixed(1));

    res.json({
      team: { name: team.name, code: team.code },
      ready: true,
      memberCount: uniqueUserIds.length,
      assessmentCount: teamResults.length,
      teamProfile,
      insights: {
        dominantTrait: maxTrait,
        developmentArea: minTrait,
        dynamicRange: Number(dynamicRange.toFixed(2)),
        cohesionScore,
        stressResilience: Number(((1 - teamProfile.dassAverages.Stress / 42) * 100).toFixed(1)),
        emotionalBalance: Number(((1 - teamProfile.dassAverages.Anxiety / 42) * 100).toFixed(1)),
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error("Team report error:", error instanceof Error ? error.message : "Unknown");
    res.status(500).json({ error: "Failed to generate team report" });
  }
});

router.get("/validate/:code", async (req, res: Response) => {
  try {
    const paramValidation = teamCodeParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({ error: "Invalid team code format" });
    }
    const { code } = paramValidation.data;
    const [team] = await db.select({ name: teams.name, code: teams.code }).from(teams).where(sql`${teams.code} = ${code}`);
    if (!team) {
      return res.status(404).json({ error: "Invalid team code" });
    }
    res.json({ valid: true, teamName: team.name });
  } catch (error) {
    res.status(500).json({ error: "Failed to validate team code" });
  }
});

export default router;
