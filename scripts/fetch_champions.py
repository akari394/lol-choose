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
        print(f"{role.upper()} 取得した行数: {len(rows)}")

        champions = []

        for row in rows:
            name_tag = row.select_one("strong.hidden.flex-1.truncate.md\\:block")
            if not name_tag:
                continue
            champ_name = name_tag.text.strip()

            spans = row.select("span.text-gray-500")
            if len(spans) < 3:
                continue

            pick_rate_text = spans[2].text.strip().replace('%', '')
            try:
                pick_rate = float(pick_rate_text)
            except ValueError:
                continue

            if pick_rate >= 1.0:
                champions.append((champ_name, pick_rate))

        # CSV保存（チャンピオン名のみ）
        with open(filename, mode='w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            for champ in champions:
                writer.writerow([champ[0]])

        print(f"{filename} を作成しました。チャンピオン数: {len(champions)}")

finally:
    driver.quit()
