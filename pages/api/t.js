export default async function handler(req, res) {
  let url = req.query.url
  if (req.query.is) {
    url = url + "&is=" + req.query.is
  }

  if (req.query.hm) {
    url = url + "&hm=" + req.query.hm;
  }

  console.log(url)

  try {
    const response = await fetch(url);
    const reader = response.body.getReader();
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      chunks.push(value);
    }

    const buffer = Buffer.concat(chunks);
    res.setHeader('Content-Type', "video/mp4");
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching video');
  }
}