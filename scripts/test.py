import requests
import pandas as pd

# APIのURL（versionを指定）
version = '15.17.1'  # 必要なバージョンを指定
url = f'https://ddragon.leagueoflegends.com/cdn/{version}/data/ja_JP/champion.json'

# APIからデータを取得
response = requests.get(url)
data = response.json()

# 日本語のチャンピオン名をリストに抽出
champions = [champion['name'] for champion in data['data'].values()]

# pandasのDataFrameに変換
df = pd.DataFrame(champions, columns=["チャンピオン名"])

# CSVファイルに保存
df.to_csv('champions_from_api_ja.csv', index=False, encoding='utf-8-sig')

print("日本語のチャンピオン名CSVファイルが作成されました！")

