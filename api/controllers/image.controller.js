import mongoose from 'mongoose';
import Image from '../models/image.model.js';
import { errorHandler } from '../utils/error.js';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export const uploadImage = async (req, res, next) => {
  try {
    // express.raw only parses image/* bodies; anything else arrives unparsed
    if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
      return next(errorHandler(400, 'Only image files are allowed!'));
    }
    if (req.body.length > MAX_IMAGE_BYTES) {
      return next(errorHandler(413, 'Image must be less than 2 MB!'));
    }
    const image = await Image.create({
      data: req.body,
      contentType: req.get('content-type'),
      userRef: req.user.id,
    });
    res.status(201).json({ url: `/api/image/${image._id}` });
  } catch (error) {
    next(error);
  }
};

export const getImage = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(errorHandler(404, 'Image not found!'));
    }
    const image = await Image.findById(req.params.id);
    if (!image) {
      return next(errorHandler(404, 'Image not found!'));
    }
    res.set('Content-Type', image.contentType);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(image.data);
  } catch (error) {
    next(error);
  }
};

// Removes stored images referenced by app-served URLs (/api/image/<id>).
// External URLs (e.g. old Firebase links) are ignored.
export const deleteImagesByUrls = async (urls) => {
  const ids = (urls || [])
    .map((url) => {
      const match =
        typeof url === 'string' && url.match(/^\/api\/image\/([0-9a-fA-F]{24})$/);
      return match ? match[1] : null;
    })
    .filter(Boolean);
  if (ids.length > 0) {
    await Image.deleteMany({ _id: { $in: ids } });
  }
};
