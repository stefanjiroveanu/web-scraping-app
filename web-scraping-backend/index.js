require("dotenv").config();
const cors = require("cors");
const axios = require("axios");
const express = require("express");
const rp = require("request-promise");
const app = express();
const puppeteer = require("puppeteer");
const { scrollPageToBottom } = require("puppeteer-autoscroll-down");
const errorHandler = require("./middleware/errorHandler");
const threshold = require("./constants/constants");
const AppError = require("./errors/AppError");

const PORT = process.env.PORT;
const sentimentAnalyserEndpoint = process.env.sentiment_host;
console.log("This is the:", sentimentAnalyserEndpoint)

app.listen(PORT, () => {
  console.log("Server started on PORT: ", PORT);
});
app.use(express.json());
app.use(errorHandler);
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.get("/scrape", async (request, response, next) => {
  const shouldScrapeImages = request.query.img;
  const shouldScrapeLinks = request.query.links;
  const analysis = request.query.analysis;
  const url = request.query.url;
  console.log(shouldScrapeImages, shouldScrapeLinks, analysis, url);
  try {
    const result = await scrapePage(url, shouldScrapeLinks, shouldScrapeImages);
    if (analysis === "simple") {
      for (let i = 0; i < result.length; i++) {
        result[i].paragraphs = await sentimentAnalysis(
          result[i],
          sentimentAnalyserEndpoint + "/simple",
          threshold[0]
        );
      }
    } else if (analysis === "ml") {
      for (let i = 0; i < result.length; i++) {
        result[i].paragraphs = await sentimentAnalysis(
          result[i],
          sentimentAnalyserEndpoint,
          threshold[0]
        );
      }
    }
    console.log(result);
    response.json(result);
  } catch (error) {
    next(error);
  }
});

const scrapePage = async (url, shouldScrapeLinks, shouldScrapeImages) => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/usr/bin/google-chrome",
    args: [
      '--no-sandbox',
      '--disable-gpu',
    ]
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(2 * 60 * 1000);

  try {
    await page.goto(url, { waitUntil: "networkidle2" });

    await page.screenshot({ path: "1.png" });
    await page.waitForSelector("a");

    const jsonPages = [];

    const jsonPage = {};

    const values = await checkDivs(page);

    jsonPage.jsonPageNumber = 0;
    jsonPage.h3s = values.h3s;
    jsonPage.paragraphs = values.paragraphs;
    jsonPage.links = [];

    const pages = await getLinksFromPage(page);
    shouldScrapeLinks === "true" ? (jsonPage.links = pages) : null;

    if (shouldScrapeImages === "true") {
      await scrollPageToBottom(page);
      jsonPage.images = await scrapeImages(page);
    }
    console.log(jsonPage);

    jsonPages.push(jsonPage);

    for (let i = 0; i < pages.length; i++) {
      const jsonPage = {};
      jsonPage.jsonPageNumber = i + 1;
      const currentPage = await browser.newPage();
      await currentPage.goto(pages[i], { waitUntil: "networkidle2" });

      const pageValue = await checkDivs(currentPage);
      const wordCount = await countWordsFromWebpage(currentPage);
      jsonPage.wordCount = wordCount;

      if (shouldScrapeImages === "true") {
        await scrollPageToBottom(currentPage);
        const pageImages = await scrapeImages(currentPage);
        jsonPage.images = pageImages;
      }

      jsonPage.h3s = pageValue.h3s;
      jsonPage.paragraphs = pageValue.paragraphs;

      const currentLinks = await getLinksFromPage(currentPage);
      shouldScrapeLinks === "true" ? (jsonPage.links = currentLinks) : null;

      jsonPages.push(jsonPage);
      console.log(jsonPage);

      await currentPage.close();
    }
    jsonPages.forEach((jsonPage) =>
      jsonPage.paragraphs.filter(
        (item, index) => jsonPage.paragraphs.indexOf(item) === index
      )
    );

    console.log(jsonPages[0]);
    if (!Object.hasOwnProperty(jsonPages[0], "links")) {
      jsonPages[0].links = [url];
    } else if (jsonPages[0].links.length === 0) {
      jsonPages[0].links.push(url);
    }

    return jsonPages;
  } catch (error) {
    throw new AppError(error.message, 500);
  } finally {
    await browser.close();
  }
};

const checkDivs = async (page) => {
  const isH3 = async (element) => {
    const computedStyle = await page.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        fontSize: style.getPropertyValue("font-size"),
      };
    }, element);

    return computedStyle.fontSize === "24px";
  };

  const isParagraph = async (element) => {
    const computedStyle = await page.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        marginBottom: style.getPropertyValue("margin-bottom"),
      };
    }, element);

    return computedStyle.marginBottom !== "0px";
  };

  const paragraphs = [];
  const h3s = [];
  const divs = await page.$$("div");

  for (const div of divs) {
    const h3 = await isH3(div);
    const pargraph = await isParagraph(div);

    if (h3) {
      h3s.push(await div.evaluate((el) => el.textContent));
    } else if (pargraph) {
      paragraphs.push(await div.evaluate((el) => el.textContent));
    }
  }
  return { h3s, paragraphs };
};

const scrapeImages = async (page) => {
  const imageSrc = await page.$$eval("img", (images) => {
    return images.map((img) => img.getAttribute("src"));
  });

  return imageSrc;
};

const sentimentAnalysis = async (result, url, threshold) => {
  const paragraphs = await Promise.all(
    result.paragraphs.map(async (paragraph) => {
      try {
        const response = await axios.post(
          url,
          JSON.stringify({ text: paragraph }),
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const sentimentResponse = parseFloat(response.data);
        if (sentimentResponse > threshold.positive) {
          return { paragraph: paragraph, sentiment: "Positive" };
        } else if (sentimentResponse < threshold.negative) {
          return { paragraph: paragraph, sentiment: "Negative" };
        } else {
          return { paragraph: paragraph, sentiment: "Neutral" };
        }
      } catch (error) {
        throw new AppError("Failed to retrieve Sentiments", 500);
      }
    })
  );
  return paragraphs;
};

async function getLinksFromPage(page) {
  let pages = await page.$$eval("a", (anchor) => anchor.map((a) => a.href));
  pages = pages.filter((item, index) => pages.indexOf(item) === index);
  return pages;
}

const countWordsFromWebpage = async (page) => {
  await page.addScriptTag({
    url: "https://code.jquery.com/jquery-3.2.1.min.js",
  });
  const wordCount = await page.evaluate(() => {
    const $ = window.$;
    $("body script").remove();
    const bodyText = $("body").text();
    const splitted = bodyText.split(/(?=[A-Z])/);
    let count = 0;
    let end = [];
    splitted.forEach((arr) => {
      end.push(splitted);
      const splittedArray = arr.split(/\s+/);
      splittedArray.forEach((word) => {
        if (/[a-zA-Z]+|[A-Za-z]+|[a-z]+|[A-Z]+/.test(word)) {
          count++;
        }
      });
    });
    return count;
  });

  return wordCount;
};
