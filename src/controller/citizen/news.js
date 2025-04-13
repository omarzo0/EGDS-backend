const axios = require('axios');
const cheerio = require('cheerio'); // For web scraping

const NEWS_SOURCES = {
  almasryalyoum: 'https://www.almasryalyoum.com/rss/rssfeeds',
  alahram: 'https://gate.ahram.org.eg/rss/home.aspx',
  alwatannews: 'https://www.alwatannews.com/rss',
  bbcArabicEgypt: 'https://feeds.bbci.co.uk/arabic/middleeast/rss.xml'
};

const getEgyptianNews = async (req, res) => {
  try {
    const { source = 'bbcArabicEgypt', limit = 10 } = req.query;
    const lang = req.query.lang || 'ar'; // Default to Arabic

    if (!NEWS_SOURCES[source]) {
      return res.status(400).json({
        success: false,
        message: lang === 'ar' ? 'مصدر الأخبار غير صحيح' : 'Invalid news source'
      });
    }

    const newsUrl = NEWS_SOURCES[source];
    const news = await fetchNewsFromSource(newsUrl, limit, lang);

    res.status(200).json({
      success: true,
      message: lang === 'ar' ? 'تم جلب الأخبار بنجاح' : 'News fetched successfully',
      data: news
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      message: req.query.lang === 'ar' ? 'حدث خطأ أثناء جلب الأخبار' : 'Failed to fetch news'
    });
  }
};

async function fetchNewsFromSource(url, limit, lang) {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    const $ = cheerio.load(response.data, { xmlMode: true });
    const items = $('item').slice(0, limit);
    
    return items.map((_, item) => {
      const $item = $(item);
      return {
        title: $item.find('title').text().trim(),
        description: $item.find('description').text().trim(),
        link: $item.find('link').text().trim(),
        date: $item.find('pubDate').text().trim(),
        source: url.includes('almasryalyoum') ? 'المصري اليوم' :
               url.includes('ahram') ? 'الأهرام' :
               url.includes('alwatannews') ? 'الوطن' : 'بي بي سي عربي'
      };
    }).get();
    
  } catch (error) {
    console.error(`Error fetching from ${url}:`, error);
    throw new Error('Failed to fetch from this source');
  }
}

// Alternative API-based approach (using NewsAPI)
async function fetchFromNewsAPI(limit, lang) {
  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  const apiUrl = `https://newsapi.org/v2/top-headlines?country=eg&pageSize=${limit}&apiKey=${NEWS_API_KEY}`;
  
  const response = await axios.get(apiUrl);
  return response.data.articles.map(article => ({
    title: lang === 'ar' ? article.title : article.title,
    description: lang === 'ar' ? article.description : article.description,
    url: article.url,
    publishedAt: article.publishedAt,
    source: article.source.name,
    imageUrl: article.urlToImage
  }));
}

module.exports = {
  getEgyptianNews
};