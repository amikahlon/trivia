from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

def test_homepage_fails():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    try:
        driver.get("http://localhost")
        # בכוונה בודקים טקסט שלא קיים כדי לגרום לטסט ליפול
        assert "ThisWillNeverExist" in driver.title or "ThisWillNeverExist" in driver.page_source
    finally:
        driver.quit()
