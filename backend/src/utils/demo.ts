import { Request } from 'express';

export const withDemoQuery = (req: Request, query: any = {}) => {
  if (req.isDemo) {
    return { ...query, is_demo: true };
  } else {
    // Ensure real users never see demo data
    return { ...query, is_demo: { $ne: true } };
  }
};

export const withDemoData = (req: Request, data: any) => {
  if (req.isDemo) {
    return { ...data, is_demo: true };
  }
  return data;
};
