const route = require("express").Router();
const Job = require("../../models/Job");
const User = require("./../../models/User");
const mongoose = require("mongoose");
const catchAsyncError = require("../../utils/catchAsyncError");
function swapKeysAndValues(obj) {
  const swapped = Object.entries(obj).map(([key, value]) => [value, key]);

  return Object.fromEntries(swapped);
}
route.get(
  "/",
  catchAsyncError(async (req, res, next) => {
    const query = req.query;
    let jobQuery = Job.find();
    const page = query.page > 1 ? query.page : 1;
    const size = 5;
    if (query.nearBy) {
      const coords = query.nearBy.split(",");
      if (Boolean(coords[0]) && Boolean(coords[1])) {
        jobQuery = jobQuery.where({
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: coords,
              },
            },
          },
        });
      }
    }
    if (query.search) {
      const keyword = query.search;
      const option = "im";
      jobQuery = jobQuery.where({
        $or: [
          { title: { $regex: keyword, $options: option } },
          { category: { $regex: keyword, $options: option } },
          { placeName: { $regex: keyword, $options: option } },
          { skills: { $regex: keyword, $options: option } },
          { description: { $regex: keyword, $options: option } },
        ],
      });
    }
    if (query.region) {
      const option = "im";
      const regionList = {
        "አዲስ አበባ": "Addis Ababa",
        አፋር: "Afar",
        አማራ: "Amhara",
        "ቤንሻንጉል ጉሙዝ": "Benishangul-gumuz",
        ድሬዳዋ: "Dire Dawa",
        ጋምቤላ: "Gambela",
        ሀረር: "Harari",
        ኦሮሚያ: "Oromia",
        ሲዳማ: "Sidama",
        ሶማሊያ: "Somali",
        "ደቡብ ምዕራብ ኢትዮጵያ": "South West Ethiopia People's Region",
        ትግራይ: "Tigray",
        ደቡብ: "Southern",
      };
      const swappedList = swapKeysAndValues(regionList);

      let filterArr = [
        query.region,
        ...(regionList[query.region] ? regionList[query.region] : []),
        ...(swappedList[query.region] ? swappedList[query.region] : []),
      ];
      jobQuery = jobQuery.where({
        $or: [
          { region: { $in: filterArr } },
          { placeName: { $regex: region, $options: option } },
        ],
      });
    }
    if (query.category) {
      const categoryList = {
        "አካውንቲንግ እና ፋይናንስ": "Accounting and Finance",
        "አስተዳደሪ እና ጸሐፊ": "Admin, Secretarial and clerk",
        "ማስታወቂያ እና ሚዲያ": "Advertising and Media",
        ግብርና: "Agriculture and Farming",
        "አርክቴክቸርና እና ግንባታ": "Architecture and Construction",
        አውቶሞቲቨ: "Automotive",
        "ባንክ እና ኢንሹራንስ": "Banking and Insurance",
        "ቢዝነስ ዲቨሎፕመንት": "Business Development",
        "ንግድ እና አስተዳደር": "Business and Administration",
        "የህዝብ ግንኙነት እና ጋዜጠኝነት": "communication, PR and Journalism",
        "የህዝብ  አገልግሎት ስራዎች": "Community Service Jobs",
        "ማማከር እና ስልጠና": "Consultancy and Training",
        " የፈጠራ ጥበብ ስራዎች": "Creative Arts Jobs",
        "የደንበኞች ግልጋሎት": "Customer Service",
        "ልማትና የፕሮጀክት አስተዳደር": "Development and Project Managment",
        "አካባቢ እና የተፈጥሮ ሀብቶች": "Environment and Natural Resources",
        "ጤና ጥበቃ": "Healthcare",
        "ሆቴል እና መስተንግዶ": "Hotel and Hospitality Jobs",
        "የሰው ሀይል እና ቅጥር": "Humant Resources and Recruitment",
        "ኢንፎርሜሽን ቴክኖሎጂ": "Information Technology",
        ቋንቋ: "Languages",
        ህጋዊ: "Legal",
        ሎጂስቲክስ: "Logistics Transportation and Supply",
        ጥገና: "Maintenance and repair",
        "አስተዳደር እና ኢንዱስትሪ": "Managment and Industrial",
        "የተፈጥሮ ሳይንስ ስራዎች": "Natural Sciences Jobs",
        ፋርማሲ: "Pharmaceutical",
        ግዢ: "Purchasing and Procurement",
        "የጥራት ማረጋገጫ": "Quality Assurance",
        "ጥናት እና ምርምር": "Research and Development",
        "የችርቻሮ፣ የጅምላ እና ስርጭት": "Retail, Wholesale and Distribution",
        "የሽያጭ እና ግብይት": "Sales and Marketing",
        "ማህበራዊ ሳይንስ": "Social Sciences and Communication",
        "ስልታዊ እቅድ": "Strategic Planning",
        ቴሌኮሚኒኬሽን: "telecommunications",
      };
      const swappedList = swapKeysAndValues(categoryList);

      let filterArr = [
        query.category,
        ...(categoryList[query.category] ? categoryList[query.category] : []),
        ...(swappedList[query.category] ? swappedList[query.category] : []),
      ];
      jobQuery = jobQuery.where({
        category: { $in: filterArr },
      });
    }
    if (query.gender) {
      const genderList = { ወንድ: "Male", ሴት: "Female" };
      const swappedList = swapKeysAndValues(categoryList);

      let filterArr = [
        query.gender,
        ...(genderList[query.gender] ? genderList[query.gender] : []),
        ...(swappedList[query.gender] ? swappedList[query.gender] : []),
      ];
      jobQuery = jobQuery.where({
        gender: { $in: filterArr },
      });
    }
    if (query.permanent) {
      const permanentList = { አዎ: "yes", አልፈልግም: "no" };
      const swappedList = swapKeysAndValues(categoryList);

      let filterArr = [
        query.permanent,
        ...(permanentList[query.permanent]
          ? permanentList[query.permanent]
          : []),
        ...(swappedList[query.permanent] ? swappedList[query.permanent] : []),
      ];
      jobQuery = jobQuery.where({
        permanent: { $in: filterArr },
      });
    }
    if (query.cvRequired) {
      const cvRequiredList = { አዎ: "yes", የማያስፈልገው: "no" };
      const swappedList = swapKeysAndValues(categoryList);

      let filterArr = [
        query.cvRequired,
        ...(cvRequiredList[query.cvRequired]
          ? cvRequiredList[query.cvRequired]
          : []),
        ...(swappedList[query.cvRequired] ? swappedList[query.cvRequired] : []),
      ];
      jobQuery = jobQuery.where({
        cvRequired: { $in: filterArr },
      });
    }

    const jobs = await jobQuery
      .where({ applicants: { $nin: [req.user.id] } }) //not to send applied houses
      .where({ approved: { $nin: [req.user.id] } }) //not to send applied houses
      .where({ rejected: { $nin: [req.user.id] } }) //not to send applied houses
      .where({ user: { $ne: mongoose.Types.ObjectId(req.user.id) } }) // not to send
      .where({ deleted: { $ne: true } }) // not to send
      .where({ isApproved: { $eq: 1 } }) // not to send
      .sort({ createdAt: -1 })
      .skip((page - 1) * size)

      .limit(size);
    res.send(jobs);
  })
);
route.get(
  "/job/:id",
  catchAsyncError(async (req, res) => {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return next(new ErrorHandler("job not found", 404));
    }
    if (job.applicants.length) {
      const bool = job.applicants.includes(req.user.id);
      if (bool) {
        const result = job.toObject();
        result.applied = true;

        return res.send({
          success: true,
          data: result,
        });
      }
    }
    if (job.approved.length) {
      const bool = job.approved.includes(req.user.id);
      const user = await User.findById(job.user).select("+phoneNumber +email");
      if (bool) {
        const result = job.toObject();
        result.isUserApproved = true;
        result.user = user;
        return res.send({
          success: true,
          data: result,
        });
      }
    }
    if (job.rejected.length) {
      const bool = job.rejected.includes(req.user.id);
      if (bool) {
        const result = job.toObject();
        result.isUserRejected = true;
        return res.send({
          success: true,
          data: result,
        });
      }
    }
    res.send({
      success: true,
      data: job,
    });
    //
  })
);

route.post(
  "/apply/:id",
  catchAsyncError(async (req, res, next) => {
    const job = await Job.findById(req.params.id);
    if (job) {
      const applicants = job.applicants;
      if (!applicants) {
        await job.updateOne({
          $set: { applicants: [] },
          $addToSet: { applicants: req.user.id },
        });
        await User.findByIdAndUpdate(req.user.id, {
          left: req.user?.left - 1,
        });
      } else {
        const bool = applicants.includes(req.user.id);
        if (bool) {
          await job.updateOne({
            $pull: { applicants: req.user.id },
          });
          await User.findByIdAndUpdate(req.user.id, {
            left: req.user?.left + 1,
          });
        } else {
          await job.updateOne({
            $addToSet: { applicants: req.user.id },
          });
          await User.findByIdAndUpdate(req.user.id, {
            left: req.user?.left - 1,
          });
        }
      }
      return res.send({ success: true });
    }
    return next(new ErrorHandler("house not found", 404));
  })
);

route.get(
  "/applied",
  catchAsyncError(async (req, res) => {
    const query = req.query;
    const jobQuery = Job.find();
    const page = query.page > 1 ? query.page : 1;
    const size = 5;
    const jobs = await jobQuery
      .where({
        applicants: { $elemMatch: { $eq: req.user.id } },
      }) //not to send applied houses
      .sort({ createdAt: -1 })
      .skip((page - 1) * size)
      .limit(size);

    res.send(jobs);
  })
);

route.get(
  "/approved",
  catchAsyncError(async (req, res) => {
    const query = req.query;
    const jobQuery = Job.find();
    const page = query.page > 1 ? query.page : 1;
    const size = 5;
    const houses = await jobQuery
      .where({
        approved: { $elemMatch: { $eq: req.user.id } },
      }) //not to send applied houses
      .sort({ updatedAt: -1 })
      .skip((page - 1) * size)
      .limit(size);

    res.send(houses);
  })
);
route.get(
  "/rejected",
  catchAsyncError(async (req, res) => {
    const query = req.query;
    const jobQuery = Job.find();
    const page = query.page > 1 ? query.page : 1;
    const size = 5;
    const houses = await jobQuery
      .where({
        rejected: { $elemMatch: { $eq: req.user.id } },
      }) //not to send applied houses
      .sort({ updatedAt: -1 })
      .skip((page - 1) * size)
      .limit(size);

    res.send(houses);
  })
);

module.exports = route;
