"""
FLUX-DNA Email Service
Postmark-Quality Delivery using Resend
"""
import os
from typing import Dict, Optional
from dotenv import load_dotenv
import resend

load_dotenv()


class EmailService:
    """
    Email delivery service for Sovereign Results
    DMARC/SPF aligned for Primary Inbox delivery
    """
    
    def __init__(self):
        self.api_key = os.environ.get('RESEND_API_KEY')
        self.sender_email = os.environ.get('RESEND_SENDER_EMAIL', 'results@flux-dna.com')
        
        if not self.api_key:
            raise ValueError("RESEND_API_KEY not found in environment")
        
        resend.api_key = self.api_key
    
    async def send_magic_link(self, to_email: str, magic_link: str, language: str = 'en') -> Dict:
        """
        Send magic link authentication email
        
        Args:
            to_email: Recipient email address
            magic_link: Authentication URL
            language: 'en' or 'ar'
            
        Returns:
            Send status
        """
        subject = "Your FLUX-DNA Access Link" if language == 'en' else "رابط الدخول إلى FLUX-DNA"
        
        html_content = self._magic_link_template(magic_link, language)
        
        try:
            params = {
                "from": self.sender_email,
                "to": [to_email],
                "subject": subject,
                "html": html_content
            }
            
            email = resend.Emails.send(params)
            return {"success": True, "email_id": email.get('id')}
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def send_results_link(self, to_email: str, results_link: str, sovereign_title: str, language: str = 'en') -> Dict:
        """
        Send time-gated results link (24h / 3-click)
        
        Args:
            to_email: Recipient email
            results_link: Time-gated results URL
            sovereign_title: User's unique title (e.g., "The Strategic Phoenix")
            language: 'en' or 'ar'
            
        Returns:
            Send status
        """
        subject = f"Your Sovereign Results: {sovereign_title}" if language == 'en' else f"نتائجك السيادية: {sovereign_title}"
        
        html_content = self._results_link_template(results_link, sovereign_title, language)
        
        try:
            params = {
                "from": self.sender_email,
                "to": [to_email],
                "subject": subject,
                "html": html_content
            }
            
            email = resend.Emails.send(params)
            return {"success": True, "email_id": email.get('id')}
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def send_founder_daily_pulse(self, date: str, metrics: Dict) -> Dict:
        """
        Send daily analytics pulse to founder (9:00 AM AST)
        
        Args:
            date: Report date
            metrics: Aggregated analytics
            
        Returns:
            Send status
        """
        founder_email = "Yazeedx91@gmail.com"
        subject = f"FLUX-DNA Daily Pulse - {date}"
        
        html_content = self._founder_pulse_template(date, metrics)
        
        try:
            params = {
                "from": self.sender_email,
                "to": [founder_email],
                "subject": subject,
                "html": html_content
            }
            
            email = resend.Emails.send(params)
            return {"success": True, "email_id": email.get('id')}
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def send_ai_strategic_pulse(self, date: str, briefing: str, metrics: Dict) -> Dict:
        """
        Send AI-generated strategic briefing to founder
        
        Args:
            date: Report date
            briefing: Claude-generated strategic analysis
            metrics: Raw metrics snapshot
            
        Returns:
            Send status
        """
        founder_email = "Yazeedx91@gmail.com"
        subject = f"🧠 FLUX-DNA Strategic Intelligence Briefing - {date}"
        
        html_content = self._ai_strategic_pulse_template(date, briefing, metrics)
        
        try:
            params = {
                "from": self.sender_email,
                "to": [founder_email],
                "subject": subject,
                "html": html_content
            }
            
            email = resend.Emails.send(params)
            return {"success": True, "email_id": email.get('id')}
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _magic_link_template(self, magic_link: str, language: str) -> str:
        """HTML template for magic link email"""
        if language == 'ar':
            return f"""
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #020617 0%, #1e1b4b 100%); margin: 0; padding: 40px 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.05); backdrop-filter: blur(20px); border: 1px solid rgba(226,232,240,0.1); border-radius: 16px; padding: 40px;">
                    <h1 style="color: #4F46E5; text-align: center; font-size: 32px; margin-bottom: 20px;">🔥 FLUX-DNA</h1>
                    <h2 style="color: #E2E8F0; text-align: center; font-size: 24px; margin-bottom: 30px;">رابط الدخول السيادي</h2>
                    <p style="color: #CBD5E1; font-size: 18px; line-height: 1.6; margin-bottom: 30px;">
                        السلام عليكم،<br><br>
                        مرحبًا بك في FLUX-DNA - ملاذك السيادي للتحليل النفسي المتقدم.
                    </p>
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="{magic_link}" style="display: inline-block; background: linear-gradient(135deg, #4F46E5, #6366F1); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: bold;">ادخل إلى ملاذك</a>
                    </div>
                    <p style="color: #94A3B8; font-size: 14px; text-align: center;">
                        هذا الرابط صالح لمدة 15 دقيقة فقط<br>
                        إذا لم تطلب هذا الرابط، يمكنك تجاهل هذه الرسالة بأمان
                    </p>
                </div>
            </body>
            </html>
            """
        
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #020617 0%, #1e1b4b 100%); margin: 0; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.05); backdrop-filter: blur(20px); border: 1px solid rgba(226,232,240,0.1); border-radius: 16px; padding: 40px;">
                <h1 style="color: #4F46E5; text-align: center; font-size: 32px; margin-bottom: 20px;">🔥 FLUX-DNA</h1>
                <h2 style="color: #E2E8F0; text-align: center; font-size: 24px; margin-bottom: 30px;">Your Sovereign Access Link</h2>
                <p style="color: #CBD5E1; font-size: 18px; line-height: 1.6; margin-bottom: 30px;">
                    Welcome to FLUX-DNA - Your AI-Native Psychometric Sanctuary.<br><br>
                    Click the button below to access your secure assessment portal.
                </p>
                <div style="text-align: center; margin: 40px 0;">
                    <a href="{magic_link}" style="display: inline-block; background: linear-gradient(135deg, #4F46E5, #6366F1); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: bold;">Enter Your Sanctuary</a>
                </div>
                <p style="color: #94A3B8; font-size: 14px; text-align: center;">
                    This link expires in 15 minutes<br>
                    If you didn't request this, you can safely ignore this email
                </p>
            </div>
        </body>
        </html>
        """
    
    def _results_link_template(self, results_link: str, sovereign_title: str, language: str) -> str:
        """HTML template for results email"""
        if language == 'ar':
            return f"""
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #020617 0%, #1e1b4b 100%); margin: 0; padding: 40px 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.05); backdrop-filter: blur(20px); border: 1px solid rgba(226,232,240,0.1); border-radius: 16px; padding: 40px;">
                    <h1 style="color: #FFD700; text-align: center; font-size: 36px; margin-bottom: 10px;">👑</h1>
                    <h1 style="color: #4F46E5; text-align: center; font-size: 32px; margin-bottom: 20px;">{sovereign_title}</h1>
                    <p style="color: #E2E8F0; font-size: 20px; text-align: center; margin-bottom: 30px;">
                        بنار العنقاء، تم التعرف عليك
                    </p>
                    <p style="color: #CBD5E1; font-size: 18px; line-height: 1.6; margin-bottom: 30px;">
                        نتائجك السيادية جاهزة. هذا التقييم يمثل قيمة <strong style="color: #FFD700;">5,500 ريال سعودي</strong> - هدية للشعب السعودي (<strong style="color: #10B981;">0 ريال</strong>).
                    </p>
                    <div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 20px; margin: 30px 0;">
                        <p style="color: #FCA5A5; font-size: 16px; margin: 0; text-align: center;">
                            ⏰ <strong>بوابة زمنية:</strong> 24 ساعة | 3 وصول فقط<br>
                            هذا الرابط يدمر نفسه تلقائيًا بعد 24 ساعة أو 3 زيارات
                        </p>
                    </div>
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="{results_link}" style="display: inline-block; background: linear-gradient(135deg, #4F46E5, #6366F1); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: bold;">اعرض نتائجك السيادية</a>
                    </div>
                    <p style="color: #94A3B8; font-size: 14px; text-align: center;">
                        🔥 العنقاء صعدت | 👁️ الحارس يراقب | 🕊️ الشعب حر
                    </p>
                </div>
            </body>
            </html>
            """
        
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #020617 0%, #1e1b4b 100%); margin: 0; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.05); backdrop-filter: blur(20px); border: 1px solid rgba(226,232,240,0.1); border-radius: 16px; padding: 40px;">
                <h1 style="color: #FFD700; text-align: center; font-size: 36px; margin-bottom: 10px;">👑</h1>
                <h1 style="color: #4F46E5; text-align: center; font-size: 32px; margin-bottom: 20px;">{sovereign_title}</h1>
                <p style="color: #E2E8F0; font-size: 20px; text-align: center; margin-bottom: 30px;">
                    By the fire of the Phoenix, you are recognized
                </p>
                <p style="color: #CBD5E1; font-size: 18px; line-height: 1.6; margin-bottom: 30px;">
                    Your Sovereign Results are ready. This assessment represents a <strong style="color: #FFD700;">SAR 5,500 value</strong> - a gift to the Saudi people (<strong style="color: #10B981;">SAR 0 cost</strong>).
                </p>
                <div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 20px; margin: 30px 0;">
                    <p style="color: #FCA5A5; font-size: 16px; margin: 0; text-align: center;">
                        ⏰ <strong>Time-Gate:</strong> 24 Hours | 3 Access Only<br>
                        This link self-destructs after 24 hours or 3 visits
                    </p>
                </div>
                <div style="text-align: center; margin: 40px 0;">
                    <a href="{results_link}" style="display: inline-block; background: linear-gradient(135deg, #4F46E5, #6366F1); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: bold;">View Your Sovereign Results</a>
                </div>
                <p style="color: #94A3B8; font-size: 14px; text-align: center;">
                    🔥 THE PHOENIX HAS ASCENDED | 👁️ THE GUARDIAN IS WATCHING | 🕊️ THE PEOPLE ARE FREE
                </p>
            </div>
        </body>
        </html>
        """
    
    def _founder_pulse_template(self, date: str, metrics: Dict) -> str:
        """HTML template for founder daily pulse"""
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Courier New', monospace; background: #0a0a0a; margin: 0; padding: 40px 20px; color: #00ff00;">
            <div style="max-width: 800px; margin: 0 auto; background: #1a1a1a; border: 2px solid #00ff00; border-radius: 8px; padding: 30px;">
                <h1 style="color: #00ff00; font-size: 28px; margin-bottom: 10px;">🔥 FLUX-DNA DAILY PULSE</h1>
                <p style="color: #888; font-size: 14px; margin-bottom: 30px;">Intelligence Director Report | {date}</p>
                
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #4F46E5; font-size: 20px; margin-bottom: 15px;">📊 24-HOUR METRICS</h2>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin: 10px 0; padding: 10px; background: rgba(79,70,229,0.1); border-left: 3px solid #4F46E5;">
                            <strong>Total Ascensions (Users):</strong> {metrics.get('total_users', 0)}
                        </li>
                        <li style="margin: 10px 0; padding: 10px; background: rgba(79,70,229,0.1); border-left: 3px solid #4F46E5;">
                            <strong>Assessments Completed:</strong> {metrics.get('assessments_completed', 0)}
                        </li>
                        <li style="margin: 10px 0; padding: 10px; background: rgba(79,70,229,0.1); border-left: 3px solid #4F46E5;">
                            <strong>Sovereigness Sanctuary Access:</strong> {metrics.get('sanctuary_access', 0)}
                        </li>
                        <li style="margin: 10px 0; padding: 10px; background: rgba(79,70,229,0.1); border-left: 3px solid #4F46E5;">
                            <strong>Language Split:</strong> EN {metrics.get('language_en', 0)}% | AR {metrics.get('language_ar', 0)}%
                        </li>
                    </ul>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #FFD700; font-size: 20px; margin-bottom: 15px;">🌍 GEOGRAPHIC HEAT MAP</h2>
                    <ul style="list-style: none; padding: 0;">
                        <li style="margin: 10px 0;">🇸🇦 Saudi Arabia: {metrics.get('geo_saudi', 0)}%</li>
                        <li style="margin: 10px 0;">🌐 Global: {metrics.get('geo_global', 0)}%</li>
                    </ul>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #10B981; font-size: 20px; margin-bottom: 15px;">💎 VALUE DELIVERED</h2>
                    <p style="margin: 10px 0;">Total SAR Value Given to People: <strong style="color: #FFD700;">SAR {metrics.get('total_users', 0) * 5500:,}</strong></p>
                    <p style="margin: 10px 0; color: #888; font-size: 14px;">At SAR 0 cost - Pure sovereign liberation</p>
                </div>
                
                <div style="background: rgba(239,68,68,0.1); border-left: 3px solid #EF4444; padding: 15px; margin: 20px 0;">
                    <h3 style="color: #EF4444; margin: 0 0 10px 0;">⚠️ CRITICAL ALERTS</h3>
                    <p style="margin: 0; color: #FCA5A5;">{metrics.get('critical_alerts', 'No critical alerts. All systems sovereign.')}</p>
                </div>
                
                <p style="color: #888; font-size: 12px; text-align: center; margin-top: 40px;">
                    🔥 THE PHOENIX IS WATCHING | 👁️ THE GUARDIAN REPORTS | 🕊️ THE PEOPLE ARE ASCENDING
                </p>
            </div>
        </body>
        </html>
        """


# Singleton instance
_email_service = None

def get_email_service() -> EmailService:
    """Get or create email service singleton"""
    global _email_service
    if _email_service is None:
        _email_service = EmailService()
    return _email_service
