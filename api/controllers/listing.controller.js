import Listing from '../models/listing.model.js';
import { errorHandler } from '../utils/error.js';

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const pickListingFields = (body) => {
  const {
    name,
    description,
    address,
    regularPrice,
    discountPrice,
    bathrooms,
    bedrooms,
    furnished,
    parking,
    type,
    offer,
    imageUrls,
  } = body;
  return {
    name,
    description,
    address,
    regularPrice,
    discountPrice,
    bathrooms,
    bedrooms,
    furnished,
    parking,
    type,
    offer,
    imageUrls,
  };
};

const validateListing = (data) => {
  if (!['sale', 'rent'].includes(data.type)) {
    return 'Listing type must be sale or rent!';
  }
  if (!Array.isArray(data.imageUrls) || data.imageUrls.length < 1) {
    return 'A listing needs at least one image!';
  }
  if (data.imageUrls.length > 6) {
    return 'A listing can have at most 6 images!';
  }
  if (+data.regularPrice < 0 || +data.discountPrice < 0) {
    return 'Prices cannot be negative!';
  }
  if (data.offer && +data.discountPrice >= +data.regularPrice) {
    return 'Discount price must be lower than regular price!';
  }
  return null;
};

export const createListing = async (req, res, next) => {
  try {
    const data = pickListingFields(req.body);
    const validationError = validateListing(data);
    if (validationError) return next(errorHandler(400, validationError));
    // userRef always comes from the verified token, never from the client
    const listing = await Listing.create({ ...data, userRef: req.user.id });
    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }

    if (req.user.id !== listing.userRef) {
      return next(errorHandler(401, 'You can only delete your own listings!'));
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json('Listing has been deleted!');
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }
    if (req.user.id !== listing.userRef) {
      return next(errorHandler(401, 'You can only update your own listings!'));
    }

    const data = pickListingFields(req.body);
    const validationError = validateListing(data);
    if (validationError) return next(errorHandler(400, validationError));

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $set: data },
      { new: true, runValidators: true }
    );
    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(errorHandler(404, 'Listing not found!'));
    }
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 9, 100);
    const startIndex = Math.max(parseInt(req.query.startIndex) || 0, 0);

    let offer = req.query.offer;
    if (offer === undefined || offer === 'false') {
      offer = { $in: [false, true] };
    } else {
      offer = true;
    }

    let furnished = req.query.furnished;
    if (furnished === undefined || furnished === 'false') {
      furnished = { $in: [false, true] };
    } else {
      furnished = true;
    }

    let parking = req.query.parking;
    if (parking === undefined || parking === 'false') {
      parking = { $in: [false, true] };
    } else {
      parking = true;
    }

    let type = req.query.type;
    if (type === undefined || type === 'all' || !['sale', 'rent'].includes(type)) {
      type = { $in: ['sale', 'rent'] };
    }

    const searchTerm = escapeRegex(req.query.searchTerm || '');

    const allowedSortFields = ['createdAt', 'regularPrice'];
    const sort = allowedSortFields.includes(req.query.sort)
      ? req.query.sort
      : 'createdAt';
    const order = req.query.order === 'asc' ? 'asc' : 'desc';

    const query = {
      name: { $regex: searchTerm, $options: 'i' },
      offer,
      furnished,
      parking,
      type,
    };

    const minPrice = parseInt(req.query.minPrice);
    const maxPrice = parseInt(req.query.maxPrice);
    const priceFilter = {};
    if (!isNaN(minPrice)) priceFilter.$gte = minPrice;
    if (!isNaN(maxPrice)) priceFilter.$lte = maxPrice;
    if (Object.keys(priceFilter).length > 0) {
      query.regularPrice = priceFilter;
    }

    const listings = await Listing.find(query)
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};
