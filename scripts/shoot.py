import asyncio, os, shutil
from playwright.async_api import async_playwright
URL = os.environ.get("URL", "http://localhost:4173/")
OUT = "docs/screenshots"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.connect_over_cdp("http://localhost:29229")
        ctx = await b.new_context(viewport={"width": 1440, "height": 900}, record_video_dir="docs/video/raw", record_video_size={"width": 1440, "height": 900})
        pg = await ctx.new_page()
        await pg.goto(URL); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=f"{OUT}/01-landing.png")
        await pg.click("[data-id=euler-41]"); await pg.wait_for_timeout(700)
        await pg.fill("input[name=n]", "10"); await pg.click("form button.primary"); await pg.wait_for_timeout(1200)
        await pg.screenshot(path=f"{OUT}/02-claim-survives.png")
        await pg.fill("input[name=n]", ""); await pg.type("input[name=n]", "40", delay=150); await pg.click("form button.primary"); await pg.wait_for_timeout(1800)
        await pg.screenshot(path=f"{OUT}/03-broken-stamp.png", full_page=True)
        await pg.click("[data-id=gcd-17]"); await pg.wait_for_timeout(700)
        for _ in range(2):
            await pg.click("#hint"); await pg.wait_for_timeout(900)
        await pg.screenshot(path=f"{OUT}/04-boss-hints.png", full_page=True)
        await pg.fill("input[name=n]", "8424432925592889329288197322308900672459420460792433"); await pg.wait_for_timeout(600)
        await pg.click("form button.primary"); await pg.wait_for_timeout(2000)
        await pg.screenshot(path=f"{OUT}/05-boss-broken.png", full_page=True)
        await pg.click("[data-id=cyclotomic]"); await pg.fill("input[name=n]", "105"); await pg.click("form button.primary"); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=f"{OUT}/06-cyclotomic.png", full_page=True)
        await ctx.close()
        m = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True)
        mp = await m.new_page(); await mp.goto(URL); await mp.wait_for_timeout(1200)
        await mp.screenshot(path=f"{OUT}/07-mobile.png")
        await mp.screenshot(path=f"{OUT}/08-mobile-full.png", full_page=True)
        await m.close()
asyncio.run(main())
