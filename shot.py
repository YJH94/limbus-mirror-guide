import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path="/usr/bin/google-chrome")
    pg=await b.new_page(viewport={'width':1366,'height':900}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    base='file:///workspace/limbus-mirror-guide/index.html'
    await pg.goto(base); await pg.wait_for_timeout(1500); await pg.screenshot(path='screenshots/home-floors.png')
    await pg.goto(base+'#gift?q=烧伤'); await pg.wait_for_timeout(1500); await pg.screenshot(path='screenshots/search-gifts.png')
    await pg.click('.gc'); await pg.wait_for_timeout(800); await pg.screenshot(path='screenshots/gift-detail.png')
    await pg.goto(base+'#pack'); await pg.reload(); await pg.wait_for_timeout(1000); await pg.click('#packGrid .pc >> nth=1'); await pg.wait_for_timeout(800); await pg.screenshot(path='screenshots/pack-detail.png')
    m=await b.new_page(viewport={'width':390,'height':844},device_scale_factor=2); await m.goto(base); await m.wait_for_timeout(1000); await m.screenshot(path='screenshots/mobile-home.png')
    print('errors',errs); await b.close()
asyncio.run(main())
