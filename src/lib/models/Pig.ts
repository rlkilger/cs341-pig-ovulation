import mongoose from 'mongoose';

export const pigSnapshotSchema = new mongoose.Schema({
  img:              String,
  isSwelling:       Boolean,
  presumedPregnant: Boolean,
  notes:            String,
  pig:              { type: mongoose.Schema.Types.ObjectId, ref: 'Pig' },
  timestamp:        Date,
});

// Create the schema
export const pigSchema = new mongoose.Schema({
  name:        String,
  img:         String,
  birthDate:   Date,
  breed:       String,
  description: String,
  farmId:      String,
});

// Create the actual model to use
export const Pig         = mongoose.model('Pig',         pigSchema);
export const PigSnapshot = mongoose.model('PigSnapshot', pigSnapshotSchema);

// Export all the methods as a singleton to use with the user
export default {

  // Method to retreive a Pig by their id
  getById: async (id: Number) => {
    return await Pig.findById(id).exec();
  },

  // Lookup the user with a sesionId
  getByFarmId: async (farmId: String) => {
    return await Pig.find({ farmId }).exec();
  },

  // Create a new user
  create: async ({ name, image, dob, breed, description, farmId }) => {
    const pig = new Pig({
      name,
      breed,
      description,
      farmId,
      birthDate: dob,
      img: image || 'https://via.placeholder.com/300?text=Pig',
    });

    await pig.save();

    return pig;
  },

  edit: async ({ _id, name, dob, breed, description}) => {
    const pig = await Pig.findByIdAndUpdate({_id},{
      name,
      breed,
      description,
      birthDate: dob
    });
    
    return pig;
  },

  del: async ({ _id }) => {
    const pig = await Pig.findById(_id);
    if (!pig) {
      throw new Error('No pig was found.')
    }

    return await Pig.deleteOne({ _id }).exec();
  },

  createSnapshot: async (pig, { img, isSwelling, presumedPregnant, notes, timestamp }) => {
    if (!mongoose.Types.ObjectId.isValid(pig._id)) {
      return null;
    }
    //add timezone offset so date is correct.

    let offset = new Date().getTimezoneOffset()/60;
    
    timestamp = new Date(timestamp);
    
    //added 
    timestamp = timestamp.setHours(timestamp.getHours() + offset);
    // let correctDate = new Date (timestamp)
    
    const pigSnapshot = new PigSnapshot({
      pig:              pig._id,
      img:              img              || 'https://via.placeholder.com/300?text=Pig',
      isSwelling:       isSwelling       || false,
      presumedPregnant: presumedPregnant || false,
      notes:            notes            || '',
      timestamp:        timestamp        || Date.now(),
    });

    await pigSnapshot.save();

    return pigSnapshot;
  },

  getSnapshots: async (pig, limit: number = 3) => {
    if (!mongoose.Types.ObjectId.isValid(pig._id)) {
      return null;
    }

    return await PigSnapshot.find({ pig: pig._id }).sort({ timestamp: 'descending' }).limit(limit).exec();
  }

};

