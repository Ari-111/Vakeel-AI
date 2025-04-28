import pdfParse from 'pdf-parse';


export const config = {
  api: {
    bodyParser: false, // To handle FormData (file upload)
  },
};

import formidable from 'formidable';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing the file', err);
        return res.status(500).json({ error: 'Failed to parse file' });
      }

      const file = files.file;
      const fileBuffer = await fs.promises.readFile(file.filepath);

      try {
        const data = await pdfParse(fileBuffer);
        res.status(200).json({ text: data.text });
      } catch (error) {
        console.error('Error parsing PDF:', error);
        res.status(500).json({ error: 'Failed to extract text' });
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
