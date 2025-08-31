from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import csv

roles = ["top", "jungle", "mid", "adc", "support"]
filenames = ["TOP.csv", "JUG.csv", "MID.csv", "BOT.csv", "SUP.csv"]

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))

try:
    for role, filename in zip(roles, filenames):
        url = f"https://www.op.gg/ja/lol/statistics/champions?position={role}"
        driver.get(url)

        WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, "table.w-full.table-fixed tbody tr"))
        )

        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')

        rows = soup.select("table.w-full.table-fixed tbody tr")
        print(f"取得した行数: {len(rows)}")

        champions = []

        for row in rows:
            name_tag = row.select_one("strong.hidden.flex-1.truncate.md\\:block")
            if not name_tag:
                continue
            champ_name = name_tag.text.strip()

            spans = row.select("span.text-gray-500")
            print(f"{champ_name} の span.text-gray-500 の中身:")
            for i, span in enumerate(spans):
                print(f"  [{i}] -> {repr(span.text.strip())}")

            pick_rate = None
            # まず3個目があれば試す
            if len(spans) >= 3:
                try:
                    pick_rate = float(spans[2].text.strip().replace('%', ''))
                except ValueError:
                    pass

            # 3個目がなければ1個目を試す
            if pick_rate is None and len(spans) >= 1:
                try:
                    pick_rate = float(spans[0].text.strip().replace('%', ''))
                except ValueError:
                    pass

            if pick_rate is None:
                print(f"{champ_name} のピック率を取得できませんでした。スキップします。")
                continue

            print(f"ピック率: {pick_rate}")

            if pick_rate >= 1.0:
                champions.append(champ_name)

        with open(filename, mode='w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            for champ in champions:
                writer.writerow([champ])

        print(f"{filename} を作成しました。チャンピオン数: {len(champions)}")

finally:
    driver.quit()
