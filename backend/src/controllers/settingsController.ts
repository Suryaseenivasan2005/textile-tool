import { Request, Response } from 'express';
import { getDB } from '../config/database';
import { DB_CONFIG } from '../constants';
import { asyncHandler } from '../middleware/asyncHandler';

export const getSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const db = getDB();
  const settingsCollection = db.collection(DB_CONFIG.COLLECTIONS.SETTINGS);

  const settings = await settingsCollection.findOne({});

  if (!settings) {
    // Return default settings
    res.json({
      business_name: '',
      business_address: '',
      business_phone: '',
      business_email: '',
      gst_number: '',
      tax_rate: 5,
      invoice_prefix: 'INV',
    });
    return;
  }

  // Remove _id from response
  const { _id, ...settingsData } = settings;
  res.json(settingsData);
});

export const updateSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const db = getDB();
  const settingsCollection = db.collection(DB_CONFIG.COLLECTIONS.SETTINGS);

  const settings = req.body;

  // Upsert settings
  await settingsCollection.updateOne(
    {},
    {
      $set: {
        ...settings,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  const updatedSettings = await settingsCollection.findOne({});
  const { _id, ...settingsData } = updatedSettings!;

  res.json(settingsData);
});

