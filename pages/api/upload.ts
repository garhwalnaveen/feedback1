import { PrismaClient } from '@prisma/client';
import csv from 'csv-parser';
import fs from 'fs';
import multer, { Multer } from 'multer';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

// Extend the NextApiRequest type
interface NextApiRequestWithFile extends NextApiRequest {
  file: Express.Multer.File;
}

// Define the shape of a row in your CSV file
interface CsvRow {
  content: string;
}

const prisma = new PrismaClient();
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10000000 }, // limit file size to 10MB
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'text/csv') {
      return cb(new Error('Only CSV files are allowed'));
    }
    cb(null, true);
  },
});

export default async function handler(
  req: NextApiRequestWithFile,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });

  if (!session || !session.user || !session.user.id) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  console.log(session);

  upload.single('file')(req as any, res as any, async (err) => {
    if (err instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ message: 'A Multer error occurred when uploading.' });
    } else if (err) {
      return res
        .status(500)
        .json({ message: 'An unknown error occurred when uploading.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const results: CsvRow[] = [];

    fs.createReadStream(req.file.path)
      .pipe(csv()) // No quote option
      .on('data', (row: CsvRow) => results.push(row))
      .on('end', async () => {
        const feedbackPromises = results.map((row: CsvRow) => {
          return prisma.feedback.create({
            data: {
              content: row.content,
              userId: session.user.id,
            },
          });
        });

        try {
          await Promise.all(feedbackPromises);
          res.json({ message: 'Feedback uploaded successfully' });
        } catch (error) {
          console.error(error);
          res
            .status(500)
            .json({
              message:
                'An error occurred while inserting data into the database',
            });
        }
      })
      .on('error', (error) => {
        console.error(error);
        res
          .status(500)
          .json({ message: 'An error occurred while reading the file' });
      });
  });
}
