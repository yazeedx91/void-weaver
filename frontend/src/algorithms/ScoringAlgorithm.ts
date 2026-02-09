import type { 
  HEXACOResponse, 
  DASSResponse, 
  TEIQueResponse,
  HEXACOScores, 
  DASSScores, 
  TEIQueScores,
  StabilityFlags,
  ScoringInput,
  ScoringOutput,
  HEXACOItem,
  DASSItem,
  TEIQueItem
} from '../types/psychometric';

// HEXACO-60 Item Configuration with reverse-coding
export const HEXACO_ITEMS: HEXACOItem[] = [
  // Honesty-Humility (Items 1-10)
  { id: 1, facet: 'HonestyHumility', text: "I wouldn't use flattery to get a raise or promotion at work, even if I thought it would succeed.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 2, facet: 'HonestyHumility', text: "If I want something from someone, I will laugh at that person's worst jokes.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 3, facet: 'HonestyHumility', text: "I wouldn't pretend to like someone just to get that person to do favors for me.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 4, facet: 'HonestyHumility', text: "If I knew that I could never get caught, I would be willing to steal a million dollars.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 5, facet: 'HonestyHumility', text: "I would never accept a bribe, even if it were very large.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 6, facet: 'HonestyHumility', text: "I'd be tempted to use counterfeit money, if I were sure I could get away with it.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 7, facet: 'HonestyHumility', text: "Having a lot of money is not especially important to me.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 8, facet: 'HonestyHumility', text: "I would get a lot of pleasure from owning expensive luxury goods.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 9, facet: 'HonestyHumility', text: "I think that I am entitled to more respect than the average person is.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 10, facet: 'HonestyHumility', text: "I want people to know that I am an important person of high status.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  
  // Emotionality (Items 11-20)
  { id: 11, facet: 'Emotionality', text: "I would feel afraid if I had to travel in bad weather conditions.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 12, facet: 'Emotionality', text: "I don't mind doing jobs that involve dangerous work.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 13, facet: 'Emotionality', text: "When it comes to physical danger, I am very fearful.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 14, facet: 'Emotionality', text: "Even in an emergency I wouldn't feel like panicking.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 15, facet: 'Emotionality', text: "I sometimes can't help worrying about little things.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 16, facet: 'Emotionality', text: "I rarely, if ever, have trouble sleeping due to stress or anxiety.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 17, facet: 'Emotionality', text: "I get very anxious when waiting to hear about an important decision.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 18, facet: 'Emotionality', text: "I rarely feel any strong emotions.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 19, facet: 'Emotionality', text: "I feel like crying when I see other people crying.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 20, facet: 'Emotionality', text: "I can remain calm even in situations where most people would become anxious.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  
  // Extraversion (Items 21-30)
  { id: 21, facet: 'Extraversion', text: "I rarely express my opinions in group meetings.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 22, facet: 'Extraversion', text: "In social situations, I'm usually the one who makes the first move.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 23, facet: 'Extraversion', text: "When I'm in a group of people, I'm often the one who speaks on behalf of the group.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 24, facet: 'Extraversion', text: "I tend to feel quite self-conscious when speaking in front of a group of people.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 25, facet: 'Extraversion', text: "I prefer jobs that involve active social interaction to those that involve working alone.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 26, facet: 'Extraversion', text: "I avoid making small talk with people.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 27, facet: 'Extraversion', text: "I enjoy having lots of people around to talk with.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 28, facet: 'Extraversion', text: "I find it difficult to keep a conversation going with someone I've just met.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 29, facet: 'Extraversion', text: "Most people are more upbeat and dynamic than I generally am.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 30, facet: 'Extraversion', text: "People often tell me that I should try to cheer up.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  
  // Agreeableness (Items 31-40)
  { id: 31, facet: 'Agreeableness', text: "I rarely hold a grudge, even against people who have badly wronged me.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 32, facet: 'Agreeableness', text: "My attitude toward people who have treated me badly is 'forgive and forget'.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 33, facet: 'Agreeableness', text: "If someone has cheated me once, I will always feel suspicious of that person.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 34, facet: 'Agreeableness', text: "I tend to be lenient in judging other people.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 35, facet: 'Agreeableness', text: "I am usually quite flexible in my opinions when people disagree with me.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 36, facet: 'Agreeableness', text: "People sometimes tell me that I am too critical of others.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 37, facet: 'Agreeableness', text: "I generally accept people's faults without complaining about them.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 38, facet: 'Agreeableness', text: "When people tell me that I'm wrong, my first reaction is to argue with them.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 39, facet: 'Agreeableness', text: "People sometimes tell me that I'm too stubborn.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 40, facet: 'Agreeableness', text: "I find it hard to fully forgive someone who has done something mean to me.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  
  // Conscientiousness (Items 41-50)
  { id: 41, facet: 'Conscientiousness', text: "I plan ahead and organize things, to avoid scrambling at the last minute.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 42, facet: 'Conscientiousness', text: "I often push myself very hard when trying to achieve a goal.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 43, facet: 'Conscientiousness', text: "When working on something, I don't pay much attention to small details.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 44, facet: 'Conscientiousness', text: "I make decisions based on the feeling of the moment rather than on careful thought.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 45, facet: 'Conscientiousness', text: "When working, I sometimes have difficulties due to being disorganized.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 46, facet: 'Conscientiousness', text: "I do only the minimum amount of work needed to get by.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 47, facet: 'Conscientiousness', text: "I always try to be accurate in my work, even at the expense of time.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 48, facet: 'Conscientiousness', text: "I make a lot of mistakes because I don't think before I act.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 49, facet: 'Conscientiousness', text: "People often call me a perfectionist.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 50, facet: 'Conscientiousness', text: "I prefer to do whatever comes to mind, rather than stick to a plan.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  
  // Openness to Experience (Items 51-60)
  { id: 51, facet: 'OpennessToExperience', text: "I would enjoy creating a work of art, such as a novel, a song, or a painting.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 52, facet: 'OpennessToExperience', text: "People have often told me that I have a good imagination.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 53, facet: 'OpennessToExperience', text: "I don't think of myself as the artistic or creative type.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 54, facet: 'OpennessToExperience', text: "I think that paying attention to radical ideas is a waste of time.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 55, facet: 'OpennessToExperience', text: "I like people who have unconventional views.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 56, facet: 'OpennessToExperience', text: "I find it boring to discuss philosophy.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 57, facet: 'OpennessToExperience', text: "I would be quite bored by a visit to an art gallery.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 58, facet: 'OpennessToExperience', text: "I'm interested in learning about the history and politics of other countries.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
  { id: 59, facet: 'OpennessToExperience', text: "I've never really enjoyed looking at a piece of art.", reverseCoded: true, category: 'personality', scoring_weight: 1 },
  { id: 60, facet: 'OpennessToExperience', text: "I sometimes like to just watch the wind as it blows through the trees.", reverseCoded: false, category: 'personality', scoring_weight: 1 },
];

// DASS-21 Item Configuration (CORRECTED scale assignments per official scoring key)
// Depression (D): 3, 5, 10, 13, 16, 17, 21
// Anxiety (A): 2, 4, 7, 9, 15, 19, 20
// Stress (S): 1, 6, 8, 11, 12, 14, 18
export const DASS_ITEMS: DASSItem[] = [
  { id: 1, scale: 'Stress', text: "I found it hard to wind down.", category: 'mental_health', scoring_weight: 2 },
  { id: 2, scale: 'Anxiety', text: "I was aware of dryness of my mouth.", category: 'mental_health', scoring_weight: 2 },
  { id: 3, scale: 'Depression', text: "I couldn't seem to experience any positive feeling at all.", category: 'mental_health', scoring_weight: 2 },
  { id: 4, scale: 'Anxiety', text: "I experienced breathing difficulty (e.g., excessively rapid breathing, breathlessness in the absence of physical exertion).", category: 'mental_health', scoring_weight: 2 },
  { id: 5, scale: 'Depression', text: "I found it difficult to work up the initiative to do things.", category: 'mental_health', scoring_weight: 2 },
  { id: 6, scale: 'Stress', text: "I tended to over-react to situations.", category: 'mental_health', scoring_weight: 2 },
  { id: 7, scale: 'Anxiety', text: "I experienced trembling (e.g., in the hands).", category: 'mental_health', scoring_weight: 2 },
  { id: 8, scale: 'Stress', text: "I felt that I was using a lot of nervous energy.", category: 'mental_health', scoring_weight: 2 },
  { id: 9, scale: 'Anxiety', text: "I was worried about situations in which I might panic and make a fool of myself.", category: 'mental_health', scoring_weight: 2 },
  { id: 10, scale: 'Depression', text: "I felt that I had nothing to look forward to.", category: 'mental_health', scoring_weight: 2 },
  { id: 11, scale: 'Stress', text: "I found myself getting agitated.", category: 'mental_health', scoring_weight: 2 },
  { id: 12, scale: 'Stress', text: "I found it difficult to relax.", category: 'mental_health', scoring_weight: 2 },
  { id: 13, scale: 'Depression', text: "I felt down-hearted and blue.", category: 'mental_health', scoring_weight: 2 },
  { id: 14, scale: 'Stress', text: "I was intolerant of anything that kept me from getting on with what I was doing.", category: 'mental_health', scoring_weight: 2 },
  { id: 15, scale: 'Anxiety', text: "I felt I was close to panic.", category: 'mental_health', scoring_weight: 2 },
  { id: 16, scale: 'Depression', text: "I was unable to become enthusiastic about anything.", category: 'mental_health', scoring_weight: 2 },
  { id: 17, scale: 'Depression', text: "I felt I wasn't worth much as a person.", category: 'mental_health', scoring_weight: 2 },
  { id: 18, scale: 'Stress', text: "I felt that I was rather touchy.", category: 'mental_health', scoring_weight: 2 },
  { id: 19, scale: 'Anxiety', text: "I was aware of the action of my heart in the absence of physical exertion (e.g., sense of heart rate increase, heart missing a beat).", category: 'mental_health', scoring_weight: 2 },
  { id: 20, scale: 'Anxiety', text: "I felt scared without any good reason.", category: 'mental_health', scoring_weight: 2 },
  { id: 21, scale: 'Depression', text: "I felt that life was meaningless.", category: 'mental_health', scoring_weight: 2 },
];

// TEIQue-SF (Trait Emotional Intelligence Questionnaire - Short Form) - 30 items
// 4 Factors: Well-being, Self-control, Emotionality, Sociability + 2 independent items
export const TEIQUE_ITEMS: TEIQueItem[] = [
  // Well-being factor (items: 5, 9, 12, 20, 24, 27)
  { id: 1, factor: 'Wellbeing', text: "Expressing my emotions with words is not a problem for me.", reverseCoded: false, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 2, factor: 'SelfControl', text: "I often find it difficult to see things from another person's viewpoint.", reverseCoded: true, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 3, factor: 'Emotionality', text: "On the whole, I'm a highly motivated person.", reverseCoded: false, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 4, factor: 'Sociability', text: "I usually find it difficult to regulate my emotions.", reverseCoded: true, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 5, factor: 'Wellbeing', text: "I generally don't find life enjoyable.", reverseCoded: true, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 6, factor: 'Sociability', text: "I can deal effectively with people.", reverseCoded: false, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 7, factor: 'SelfControl', text: "I tend to change my mind frequently.", reverseCoded: true, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 8, factor: 'Emotionality', text: "Many times, I can't figure out what emotion I'm feeling.", reverseCoded: true, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 9, factor: 'Wellbeing', text: "I feel that I have a number of good qualities.", reverseCoded: false, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 10, factor: 'Sociability', text: "I often find it difficult to stand up for my rights.", reverseCoded: true, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 11, factor: 'SelfControl', text: "I'm usually able to influence the way other people feel.", reverseCoded: false, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 12, factor: 'Wellbeing', text: "On the whole, I have a gloomy perspective on most things.", reverseCoded: true, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 13, factor: 'Emotionality', text: "Those close to me often complain that I don't treat them right.", reverseCoded: true, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 14, factor: 'Sociability', text: "I often find it difficult to adjust my life according to the circumstances.", reverseCoded: true, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 15, factor: 'SelfControl', text: "On the whole, I'm able to deal with stress.", reverseCoded: false, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 16, factor: 'Emotionality', text: "I often find it difficult to show my affection to those close to me.", reverseCoded: true, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 17, factor: 'Sociability', text: "I'm normally able to 'get into someone's shoes' and experience their emotions.", reverseCoded: false, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 18, factor: 'SelfControl', text: "I normally find it difficult to keep myself motivated.", reverseCoded: true, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 19, factor: 'Emotionality', text: "I'm usually able to find ways to control my emotions when I want to.", reverseCoded: false, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 20, factor: 'Wellbeing', text: "On the whole, I'm pleased with my life.", reverseCoded: false, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 21, factor: 'Sociability', text: "I would describe myself as a good negotiator.", reverseCoded: false, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 22, factor: 'SelfControl', text: "I tend to get involved in things I later wish I could get out of.", reverseCoded: true, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 23, factor: 'Emotionality', text: "I often pause and think about my feelings.", reverseCoded: false, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 24, factor: 'Wellbeing', text: "I believe I'm full of personal strengths.", reverseCoded: false, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 25, factor: 'Sociability', text: "I tend to 'back down' even if I know I'm right.", reverseCoded: true, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 26, factor: 'SelfControl', text: "I don't seem to have any power at all over other people's feelings.", reverseCoded: true, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 27, factor: 'Wellbeing', text: "I generally believe that things will work out fine in my life.", reverseCoded: false, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 28, factor: 'Emotionality', text: "I find it difficult to bond well even with those close to me.", reverseCoded: true, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 29, factor: 'SelfControl', text: "Generally, I'm able to adapt to new environments.", reverseCoded: false, category: 'emotional_intelligence', scoring_weight: 1 },
  { id: 30, factor: 'Emotionality', text: "Others admire me for being relaxed.", reverseCoded: false, category: 'emotional_intelligence', scoring_weight: 1 },
];

export class ScoringAlgorithm {
  /**
   * Calculate HEXACO-60 scores with reverse-coding (1-5 scale)
   */
  static calculateHEXACOScores(responses: HEXACOResponse[]): HEXACOScores {
    const facetScores = {
      HonestyHumility: 0,
      Emotionality: 0,
      Extraversion: 0,
      Agreeableness: 0,
      Conscientiousness: 0,
      OpennessToExperience: 0,
    };

    const facetCounts = {
      HonestyHumility: 0,
      Emotionality: 0,
      Extraversion: 0,
      Agreeableness: 0,
      Conscientiousness: 0,
      OpennessToExperience: 0,
    };

    responses.forEach(response => {
      const item = HEXACO_ITEMS.find(item => item.id === response.id);
      if (!item) return;

      let score = response.response;
      
      // Apply reverse-coding: 1-5 scale reversal (1->5, 2->4, 3->3, 4->2, 5->1)
      if (item.reverseCoded) {
        score = 6 - score;
      }

      facetScores[item.facet] += score;
      facetCounts[item.facet]++;
    });

    const finalScores: HEXACOScores = {
      HonestyHumility: facetCounts.HonestyHumility > 0 ? Math.round((facetScores.HonestyHumility / facetCounts.HonestyHumility) * 100) / 100 : 0,
      Emotionality: facetCounts.Emotionality > 0 ? Math.round((facetScores.Emotionality / facetCounts.Emotionality) * 100) / 100 : 0,
      Extraversion: facetCounts.Extraversion > 0 ? Math.round((facetScores.Extraversion / facetCounts.Extraversion) * 100) / 100 : 0,
      Agreeableness: facetCounts.Agreeableness > 0 ? Math.round((facetScores.Agreeableness / facetCounts.Agreeableness) * 100) / 100 : 0,
      Conscientiousness: facetCounts.Conscientiousness > 0 ? Math.round((facetScores.Conscientiousness / facetCounts.Conscientiousness) * 100) / 100 : 0,
      OpennessToExperience: facetCounts.OpennessToExperience > 0 ? Math.round((facetScores.OpennessToExperience / facetCounts.OpennessToExperience) * 100) / 100 : 0,
    };

    return finalScores;
  }

  /**
   * Calculate DASS-21 scores (sum * 2 to align with DASS-42)
   * Scale: 0-3 per item (Never/Sometimes/Often/Almost Always)
   */
  static calculateDASSScores(responses: DASSResponse[]): DASSScores {
    const scaleScores = {
      Depression: 0,
      Anxiety: 0,
      Stress: 0,
    };

    responses.forEach(response => {
      const item = DASS_ITEMS.find(item => item.id === response.id);
      if (!item) return;

      scaleScores[item.scale] += response.response;
    });

    // Multiply by 2 to align with DASS-42 scoring
    const finalScores: DASSScores = {
      Depression: scaleScores.Depression * 2,
      Anxiety: scaleScores.Anxiety * 2,
      Stress: scaleScores.Stress * 2,
    };

    return finalScores;
  }

  /**
   * Calculate TEIQue-SF scores with reverse-coding (1-7 scale)
   */
  static calculateTEIQueScores(responses: TEIQueResponse[]): TEIQueScores {
    const factorScores = {
      Wellbeing: 0,
      SelfControl: 0,
      Emotionality: 0,
      Sociability: 0,
    };

    const factorCounts = {
      Wellbeing: 0,
      SelfControl: 0,
      Emotionality: 0,
      Sociability: 0,
    };

    responses.forEach(response => {
      const item = TEIQUE_ITEMS.find(item => item.id === response.id);
      if (!item) return;

      let score = response.response;
      
      // Apply reverse-coding: 1-7 scale reversal
      if (item.reverseCoded) {
        score = 8 - score;
      }

      factorScores[item.factor] += score;
      factorCounts[item.factor]++;
    });

    // Calculate average for each factor
    const wellbeing = factorCounts.Wellbeing > 0 ? factorScores.Wellbeing / factorCounts.Wellbeing : 0;
    const selfControl = factorCounts.SelfControl > 0 ? factorScores.SelfControl / factorCounts.SelfControl : 0;
    const emotionality = factorCounts.Emotionality > 0 ? factorScores.Emotionality / factorCounts.Emotionality : 0;
    const sociability = factorCounts.Sociability > 0 ? factorScores.Sociability / factorCounts.Sociability : 0;

    // Global EI is the average of all factor scores
    const globalEI = (wellbeing + selfControl + emotionality + sociability) / 4;

    const finalScores: TEIQueScores = {
      Wellbeing: Math.round(wellbeing * 100) / 100,
      SelfControl: Math.round(selfControl * 100) / 100,
      Emotionality: Math.round(emotionality * 100) / 100,
      Sociability: Math.round(sociability * 100) / 100,
      GlobalEI: Math.round(globalEI * 100) / 100,
    };

    return finalScores;
  }

  /**
   * Calculate Stability Index with cross-correlation analysis
   */
  static calculateStabilityIndex(
    hexacoScores: HEXACOScores, 
    dassScores: DASSScores,
    teiqueScores?: TEIQueScores
  ): StabilityFlags {
    const flags: StabilityFlags = {
      acuteReactiveState: false,
      highFunctioningBurnout: false,
      emotionalDysregulation: false,
      overallStability: 'Stable',
    };

    // Acute Reactive State: High stress + high emotionality + low EI self-control
    if (dassScores.Stress > 24 && hexacoScores.Emotionality > 4.2) {
      flags.acuteReactiveState = true;
    }

    // High-Functioning Burnout: High conscientiousness + high depression
    if (hexacoScores.Conscientiousness > 4.5 && dassScores.Depression > 15) {
      flags.highFunctioningBurnout = true;
    }

    // Emotional Dysregulation: Low EI + High DASS scores
    if (teiqueScores && teiqueScores.SelfControl < 3.5 && (dassScores.Anxiety > 14 || dassScores.Stress > 18)) {
      flags.emotionalDysregulation = true;
    }

    // Determine overall stability
    const riskFactors = [
      flags.acuteReactiveState,
      flags.highFunctioningBurnout,
      flags.emotionalDysregulation,
      dassScores.Depression > 20,
      dassScores.Anxiety > 14,
      dassScores.Stress > 25,
      hexacoScores.Emotionality > 4.5,
      hexacoScores.Conscientiousness < 2.0,
      teiqueScores ? teiqueScores.GlobalEI < 3.0 : false,
    ];

    const riskCount = riskFactors.filter(Boolean).length;

    if (riskCount >= 4) {
      flags.overallStability = 'Critical';
    } else if (riskCount >= 2) {
      flags.overallStability = 'At Risk';
    } else {
      flags.overallStability = 'Stable';
    }

    return flags;
  }

  /**
   * Complete scoring algorithm
   */
  static calculateScores(input: ScoringInput): ScoringOutput {
    const hexacoScores = this.calculateHEXACOScores(input.hexacoResponses);
    const dassScores = this.calculateDASSScores(input.dassResponses);
    const teiqueScores = input.teiqueResponses ? this.calculateTEIQueScores(input.teiqueResponses) : undefined;
    const stabilityFlags = this.calculateStabilityIndex(hexacoScores, dassScores, teiqueScores);

    return {
      hexacoScores,
      dassScores,
      teiqueScores,
      stabilityFlags,
    };
  }

  /**
   * Get all items for all assessments
   */
  static getAllItems() {
    return {
      hexaco: HEXACO_ITEMS,
      dass: DASS_ITEMS,
      teique: TEIQUE_ITEMS,
    };
  }

  /**
   * Validate response completeness for all assessments
   */
  static validateResponseCompleteness(
    hexacoResponses: HEXACOResponse[], 
    dassResponses: DASSResponse[],
    teiqueResponses?: TEIQueResponse[]
  ): {
    isHexacoComplete: boolean;
    isDassComplete: boolean;
    isTeiqueComplete: boolean;
    isComplete: boolean;
    missingHexaco: number[];
    missingDass: number[];
    missingTeique: number[];
  } {
    const expectedHexacoIds = Array.from({ length: 60 }, (_, i) => i + 1);
    const expectedDassIds = Array.from({ length: 21 }, (_, i) => i + 1);
    const expectedTeiqueIds = Array.from({ length: 30 }, (_, i) => i + 1);

    const providedHexacoIds = hexacoResponses.map(r => r.id);
    const providedDassIds = dassResponses.map(r => r.id);
    const providedTeiqueIds = teiqueResponses?.map(r => r.id) || [];

    const missingHexaco = expectedHexacoIds.filter(id => !providedHexacoIds.includes(id));
    const missingDass = expectedDassIds.filter(id => !providedDassIds.includes(id));
    const missingTeique = expectedTeiqueIds.filter(id => !providedTeiqueIds.includes(id));

    return {
      isHexacoComplete: missingHexaco.length === 0,
      isDassComplete: missingDass.length === 0,
      isTeiqueComplete: missingTeique.length === 0,
      isComplete: missingHexaco.length === 0 && missingDass.length === 0 && missingTeique.length === 0,
      missingHexaco,
      missingDass,
      missingTeique,
    };
  }

  /**
   * Get severity classification for DASS-21 scores
   */
  static getDASSClassification(scores: DASSScores): {
    depression: 'Normal' | 'Mild' | 'Moderate' | 'Severe' | 'Extremely Severe';
    anxiety: 'Normal' | 'Mild' | 'Moderate' | 'Severe' | 'Extremely Severe';
    stress: 'Normal' | 'Mild' | 'Moderate' | 'Severe' | 'Extremely Severe';
  } {
    const classifyDepression = (score: number) => {
      if (score <= 9) return 'Normal' as const;
      if (score <= 13) return 'Mild' as const;
      if (score <= 20) return 'Moderate' as const;
      if (score <= 27) return 'Severe' as const;
      return 'Extremely Severe' as const;
    };

    const classifyAnxiety = (score: number) => {
      if (score <= 7) return 'Normal' as const;
      if (score <= 9) return 'Mild' as const;
      if (score <= 14) return 'Moderate' as const;
      if (score <= 19) return 'Severe' as const;
      return 'Extremely Severe' as const;
    };

    const classifyStress = (score: number) => {
      if (score <= 14) return 'Normal' as const;
      if (score <= 18) return 'Mild' as const;
      if (score <= 25) return 'Moderate' as const;
      if (score <= 33) return 'Severe' as const;
      return 'Extremely Severe' as const;
    };

    return {
      depression: classifyDepression(scores.Depression),
      anxiety: classifyAnxiety(scores.Anxiety),
      stress: classifyStress(scores.Stress),
    };
  }
}
