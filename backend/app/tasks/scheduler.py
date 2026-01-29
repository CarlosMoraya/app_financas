
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()

def example_job():
    print('Running scheduled job...')

# scheduler.add_job(example_job, 'interval', hours=24)

async def start_scheduler():
    scheduler.start()
