"""
📡 OSINT & PULSE OPTIMIZATION - Daily Intelligence Briefing
Headless cron job for strategic data collection and Intergalactic briefing delivery
"""

import asyncio
import aiohttp
import json
import os
from datetime import datetime, timedelta
import pytz
from typing import Dict, List, Any
from dataclasses import dataclass
import resend
from bs4 import BeautifulSoup
import feedparser
from supabase import create_client, Client

# Saudi Time Zone
RIYADH_TZ = pytz.timezone('Asia/Riyadh')

@dataclass
class OSINTSource:
    """OSINT data source configuration"""
    name: str
    url: str
    type: str  # 'rss', 'api', 'scrape'
    category: str  # 'tech', 'geopolitical', 'economic', 'cyber'
    locale: str  # 'ar', 'en', 'both'
    priority: int  # 1-10, 10 being highest

class DailyPulseCollector:
    """Advanced OSINT collector with Saudi focus"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.supabase: Client = create_client(
            config['supabase_url'],
            config['supabase_key']
        )
        
        resend.api_key = config['resend_api_key']
        
        # OSINT sources with Saudi/Middle East focus
        self.sources = [
            # Saudi Official Sources
            OSINTSource("SPA News", "https://www.spa.gov.sa/rss.xml", "rss", "geopolitical", "ar", 10),
            OSINTSource("Saudi Gazette", "https://saudigazette.com.sa/feed/", "rss", "geopolitical", "en", 9),
            OSINTSource("Arab News", "https://www.arabnews.com/rss.xml", "rss", "geopolitical", "en", 8),
            
            # Tech & Innovation
            OSINTSource("TechCrunch", "https://techcrunch.com/feed/", "rss", "tech", "en", 7),
            OSINTSource("MIT Technology Review", "https://www.technologyreview.com/feed/", "rss", "tech", "en", 8),
            OSINTSource("Wamda", "https://www.wamda.com/feed", "rss", "tech", "en", 6),
            
            # Cybersecurity
            OSINTSource("Krebs on Security", "https://krebsonsecurity.com/feed/", "rss", "cyber", "en", 8),
            OSINTSource("The Hacker News", "https://thehackernews.com/feed.xml", "rss", "cyber", "en", 7),
            
            # Economic Intelligence
            OSINTSource("SAMA (Saudi Central Bank)", "https://www.sama.gov.sa/rss-en.xml", "rss", "economic", "en", 10),
            OSINTSource("Tadawul (Saudi Stock Exchange)", "https://www.tadawul.com.sa/rss", "rss", "economic", "en", 9),
        ]
        
        # Keywords for Saudi relevance
        self.saudi_keywords = [
            'saudi', 'arabia', 'riyadh', 'jeddah', 'dammam',
            'السعودية', 'الرياض', 'جدة', 'الدمام',
            'gulf', 'gcc', 'middle east', 'mena',
            'الخليج', 'الشرق الأوسط'
        ]

    async def collect_daily_pulse(self) -> Dict[str, Any]:
        """Collect and analyze daily OSINT data"""
        print(f"[{datetime.now(RIYADH_TZ)}] Starting Daily Pulse Collection...")
        
        collected_data = {
            'timestamp': datetime.now(RIYADH_TZ).isoformat(),
            'sources_processed': 0,
            'items_collected': 0,
            'categories': {},
            'saudi_relevant': [],
            'threat_indicators': [],
            'opportunities': [],
            'market_intelligence': {}
        }
        
        async with aiohttp.ClientSession() as session:
            tasks = []
            for source in self.sources:
                task = asyncio.create_task(self._process_source(session, source))
                tasks.append(task)
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in results:
                if isinstance(result, dict):
                    self._merge_collection_data(collected_data, result)
                    collected_data['sources_processed'] += 1
        
        # Analyze and categorize
        await self._analyze_intelligence(collected_data)
        
        # Store in Supabase
        await self._store_daily_pulse(collected_data)
        
        print(f"[{datetime.now(RIYADH_TZ)}] Collection Complete: {collected_data['items_collected']} items")
        
        return collected_data

    async def _process_source(self, session: aiohttp.ClientSession, source: OSINTSource) -> Dict[str, Any]:
        """Process individual OSINT source"""
        try:
            if source.type == 'rss':
                return await self._process_rss(session, source)
            elif source.type == 'api':
                return await self._process_api(session, source)
            elif source.type == 'scrape':
                return await self._process_scrape(session, source)
        except Exception as e:
            print(f"Error processing {source.name}: {e}")
            return {}

    async def _process_rss(self, session: aiohttp.ClientSession, source: OSINTSource) -> Dict[str, Any]:
        """Process RSS feed"""
        async with session.get(source.url) as response:
            if response.status == 200:
                content = await response.text()
                feed = feedparser.parse(content)
                
                items = []
                for entry in feed.entries[:10]:  # Limit to 10 most recent
                    item = {
                        'title': entry.get('title', ''),
                        'summary': entry.get('summary', ''),
                        'link': entry.get('link', ''),
                        'published': entry.get('published', ''),
                        'source': source.name,
                        'category': source.category,
                        'locale': source.locale,
                        'saudi_relevant': self._is_saudi_relevant(entry.get('title', '') + ' ' + entry.get('summary', '')),
                        'priority': source.priority
                    }
                    items.append(item)
                
                return {
                    'source': source.name,
                    'items': items,
                    'category': source.category
                }
        
        return {}

    async def _process_api(self, session: aiohttp.ClientSession, source: OSINTSource) -> Dict[str, Any]:
        """Process API endpoint"""
        # Implementation for API-based sources
        return {}

    async def _process_scrape(self, session: aiohttp.ClientSession, source: OSINTSource) -> Dict[str, Any]:
        """Process web scraping"""
        # Implementation for web scraping sources
        return {}

    def _is_saudi_relevant(self, text: str) -> bool:
        """Check if content is Saudi-relevant"""
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in self.saudi_keywords)

    def _merge_collection_data(self, collected: Dict[str, Any], new_data: Dict[str, Any]):
        """Merge new collection data into main collection"""
        if 'items' in new_data:
            collected['items_collected'] += len(new_data['items'])
            
            # Categorize items
            category = new_data.get('category', 'general')
            if category not in collected['categories']:
                collected['categories'][category] = []
            collected['categories'][category].extend(new_data['items'])
            
            # Saudi-relevant items
            saudi_items = [item for item in new_data['items'] if item.get('saudi_relevant', False)]
            collected['saudi_relevant'].extend(saudi_items)

    async def _analyze_intelligence(self, data: Dict[str, Any]):
        """Analyze collected intelligence for insights"""
        # Threat detection
        threat_keywords = ['cyber attack', 'breach', 'vulnerability', 'hack', 'security']
        
        for category, items in data['categories'].items():
            for item in items:
                text = (item.get('title', '') + ' ' + item.get('summary', '')).lower()
                
                # Check for threats
                if any(keyword in text for keyword in threat_keywords):
                    data['threat_indicators'].append({
                        'title': item['title'],
                        'summary': item['summary'],
                        'category': category,
                        'priority': item.get('priority', 5)
                    })
                
                # Check for opportunities
                opportunity_keywords = ['investment', 'partnership', 'growth', 'expansion', 'innovation']
                if any(keyword in text for keyword in opportunity_keywords):
                    data['opportunities'].append({
                        'title': item['title'],
                        'summary': item['summary'],
                        'category': category,
                        'priority': item.get('priority', 5)
                    })

    async def _store_daily_pulse(self, data: Dict[str, Any]):
        """Store collected data in Supabase"""
        try:
            result = self.supabase.table('daily_pulse').insert(data).execute()
            return len(result.data) > 0
        except Exception as e:
            print(f"Error storing daily pulse: {e}")
            return False

    async def generate_intergalactic_briefing(self, locale: str = 'ar') -> str:
        """Generate Intergalactic briefing for users"""
        # Get latest pulse data
        pulse_data = await self._get_latest_pulse()
        
        if not pulse_data:
            return "No intelligence data available."
        
        # Generate briefing based on locale
        if locale == 'ar':
            return self._generate_arabic_briefing(pulse_data)
        else:
            return self._generate_english_briefing(pulse_data)

    def _generate_arabic_briefing(self, data: Dict[str, Any]) -> str:
        """Generate Arabic briefing"""
        briefing = f"""
# 🌌 موجز استخباراتي يومي
**التاريخ**: {datetime.now(RIYADH_TZ).strftime('%Y-%m-%d %H:%M')} بتوقيت الرياض

## 📊 نظرة عامة
- المصادر المعالجة: {data.get('sources_processed', 0)}
- العناصر المجمعة: {data.get('items_collected', 0)}
- العناصر ذات الصلة بالسعودية: {len(data.get('saudi_relevant', []))}

## 🚨 مؤشرات التهديد
"""
        
        for threat in data.get('threat_indicators', [])[:3]:
            briefing += f"- **{threat['title']}**: {threat['summary'][:100]}...\n"
        
        briefing += "\n## 💡 الفرص الاستراتيجية\n"
        
        for opportunity in data.get('opportunities', [])[:3]:
            briefing += f"- **{opportunity['title']}**: {opportunity['summary'][:100]}...\n"
        
        briefing += "\n## 🇸🇦 تطورات محلية\n"
        
        for saudi_item in data.get('saudi_relevant', [])[:3]:
            briefing += f"- **{saudi_item['title']}**: {saudi_item['summary'][:100]}...\n"
        
        briefing += f"\n---\n*تولد تلقائياً بواسطة نظام FLUX-DNA الاستخباراتي*"
        
        return briefing

    def _generate_english_briefing(self, data: Dict[str, Any]) -> str:
        """Generate English briefing"""
        briefing = f"""
# 🌌 Daily Intelligence Briefing
**Date**: {datetime.now(RIYADH_TZ).strftime('%Y-%m-%d %H:%M')} Riyadh Time

## 📊 Overview
- Sources Processed: {data.get('sources_processed', 0)}
- Items Collected: {data.get('items_collected', 0)}
- Saudi-Relevant Items: {len(data.get('saudi_relevant', []))}

## 🚨 Threat Indicators
"""
        
        for threat in data.get('threat_indicators', [])[:3]:
            briefing += f"- **{threat['title']}**: {threat['summary'][:100]}...\n"
        
        briefing += "\n## 💡 Strategic Opportunities\n"
        
        for opportunity in data.get('opportunities', [])[:3]:
            briefing += f"- **{opportunity['title']}**: {opportunity['summary'][:100]}...\n"
        
        briefing += "\n## 🇸🇦 Local Developments\n"
        
        for saudi_item in data.get('saudi_relevant', [])[:3]:
            briefing += f"- **{saudi_item['title']}**: {saudi_item['summary'][:100]}...\n"
        
        briefing += f"\n---\n*Generated automatically by FLUX-DNA Intelligence System*"
        
        return briefing

    async def _get_latest_pulse(self) -> Optional[Dict[str, Any]]:
        """Get latest pulse data from Supabase"""
        try:
            result = self.supabase.table('daily_pulse').select('*').order('timestamp', desc=True).limit(1).execute()
            
            if result.data:
                return result.data[0]
        except Exception as e:
            print(f"Error getting latest pulse: {e}")
        
        return None

    async def send_briefing_email(self, recipient_email: str, locale: str = 'ar'):
        """Send briefing via Resend email"""
        try:
            briefing = await self.generate_intergalactic_briefing(locale)
            
            params = {
                'from': 'noreply@flux-dna.com',
                'to': [recipient_email],
                'subject': f'🌌 Daily Intelligence Briefing - {datetime.now(RIYADH_TZ).strftime("%Y-%m-%d")}',
                'html': f"""
                <html>
                <body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #00ff00;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #00ff00; font-size: 24px;">FLUX-DNA Intelligence System</h1>
                        <p style="color: #888;">Daily Intergalactic Briefing</p>
                    </div>
                    <div style="background: #111; padding: 20px; border-radius: 10px; border: 1px solid #00ff00;">
                        <pre style="white-space: pre-wrap; font-family: monospace; color: #00ff00; margin: 0;">{briefing}</pre>
                    </div>
                    <div style="text-align: center; margin-top: 30px; color: #666;">
                        <p>This briefing was generated automatically by FLUX-DNA</p>
                    </div>
                </body>
                </html>
                """
            }
            
            result = resend.Emails.send(params)
            return result['id'] is not None
            
        except Exception as e:
            print(f"Error sending briefing email: {e}")
            return False

# Cron job function
async def run_daily_pulse_cron():
    """Run daily pulse collection as headless cron job"""
    from backend.config.settings import settings
    
    collector = DailyPulseCollector({
        'supabase_url': settings.SUPABASE_URL,
        'supabase_key': settings.SUPABASE_ANON_KEY,
        'resend_api_key': settings.RESEND_API_KEY
    })
    
    # Collect intelligence
    pulse_data = await collector.collect_daily_pulse()
    
    # Send briefings to subscribed users
    # (Implementation depends on user subscription system)
    
    return pulse_data

if __name__ == "__main__":
    asyncio.run(run_daily_pulse_cron())
