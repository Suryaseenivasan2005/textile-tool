import { Request, Response } from 'express';
import { getDB } from '../config/database';
import { DB_CONFIG } from '../constants';
import { asyncHandler } from '../middleware/asyncHandler';
import { withDemoQuery, withDemoData } from '../utils/demo';

export const getSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const db = getDB();
  const settingsCollection = db.collection(DB_CONFIG.COLLECTIONS.SETTINGS);

  const settings = await settingsCollection.findOne(withDemoQuery(req as any, {}));

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
  const updateData = withDemoData(req as any, settings);

  // Upsert settings
  await settingsCollection.updateOne(
    withDemoQuery(req as any, {}),
    {
      $set: {
        ...updateData,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  const updatedSettings = await settingsCollection.findOne(withDemoQuery(req as any, {}));
  const { _id, ...settingsData } = updatedSettings!;

  res.json(settingsData);
});

