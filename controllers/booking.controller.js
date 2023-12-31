const Booking = require("../models/Booking");
const Conselor = require("../models/Conselor");
const { createMeeting } = require("./zoom.controller");

module.exports = {
  createBooking: async (req, res) => {
    const { conselor_id, tanggal_konseling, media_konseling } = req.body;

    const user = req.user;

    // const findUser = await User.findById(user.id);

    const user_id = user.id;

    const kode_pembayaran = "INCARE-" + user_id + "-" + Date.now();

    if (
      (!conselor_id || !kode_pembayaran || !tanggal_konseling, !media_konseling)
    ) {
      return res.status(400).json({
        message: "Semua field harus diisi",
      });
    }

    try {
      if (media_konseling === "zoom") {
        const findKonselor = await Conselor.findById(conselor_id)
          .select("user_id")
          .populate("user_id", "fullname")
          .exec();

        const zoomMeeting = await createMeeting(
          "Konseling Dr. " + findKonselor.user_id.fullname,
          60,
          tanggal_konseling
        );

        const data = await Booking.create({
          user_id,
          conselor_id,
          tanggal_konseling,
          media_konseling,
          link_konseling: zoomMeeting,
          kode_pembayaran,
          status: "pending",
        });
        await Conselor.updateOne(
          { _id: conselor_id },
          { $pull: { schedule: { begin: tanggal_konseling } } }
        );

        res.json({
          message: "Booking berhasil dibuat",
          data,
        });
      } else {
        const data = await Booking.create({
          user_id,
          conselor_id,
          tanggal_konseling,
          media_konseling,
          kode_pembayaran,
          status: "pending",
        });
        await Conselor.updateOne(
          { _id: conselor_id },
          { $pull: { schedule: { begin: tanggal_konseling } } }
        );

        res.json({
          message: "Booking berhasil dibuat",
          data,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: "Terjadi error",
        error: error.message,
      });
    }
  },

  getBookingById: async (req, res) => {
    const { id } = req.params;

    try {
      const data = await Booking.findById(id)
        .populate("user_id")
        .populate({
          path: "conselor_id",
          populate: {
            path: "user_id",
            select: "fullname",
          },
        })
        .exec();

      res.json({
        message: "Data booking by booking id berhasil didapatkan",
        data,
      });
    } catch (error) {
      res.status(500).json({
        message: "Terjadi error",
        error: error.message,
      });
    }
  },

  getBookingByUserId: async (req, res) => {
    const user = req.user;

    const user_id = user.id;

    try {
      const data = await Booking.find({ user_id })
        .populate("user_id")
        .populate({
          path: "conselor_id",
          populate: {
            path: "user_id",
            select: "fullname",
          },
        })
        .exec();

      res.json({
        message: "Data booking by user id berhasil didapatkan",
        data,
      });
    } catch (error) {
      res.status(500).json({
        message: "Terjadi error",
        error: error.message,
      });
    }
  },

  getBookingByConselorId: async (req, res) => {
    const { conselor_id } = req.params;

    try {
      const data = await Booking.find({ conselor_id })
        .populate("user_id")
        .populate({
          path: "conselor_id",
          populate: {
            path: "user_id",
            select: "fullname",
          },
        })
        .exec();

      res.json({
        message: "Data booking by conselor id berhasil didapatkan",
        data,
      });
    } catch (error) {
      res.status(500).json({
        message: "Terjadi error",
        error: error.message,
      });
    }
  },

  readBooking: async (req, res) => {
    try {
      const data = await Booking.find()
        .sort({ createdAt: -1 })
        .populate("conselor_id")
        .populate("user_id")
        .exec();

      res.json({
        message: "Data booking berhasil didapatkan",
        data,
      });
    } catch (error) {
      res.status(500).json({
        message: "Terjadi error",
        error: error.message,
      });
    }
  },

  updateBooking: async (req, res) => {
    const { id } = req.params;

    const { status, tanggal_konseling } = req.body;

    try {
      const data = await Booking.findOneAndUpdate(
        { kode_pembayaran: id },
        {
          status,
        }
      );

      const findBook = await Booking.findOne({ kode_pembayaran: id });

      res.json({
        message: "Booking berhasil diupdate",
        data: findBook,
      });
    } catch (error) {
      res.status(500).json({
        message: "Terjadi error",
        error: error.message,
      });
    }
  },

  deleteBooking: async (req, res) => {
    const { id } = req.params;

    try {
      const data = await Booking.findByIdAndDelete({ _id: id });

      res.json({
        message: "Booking berhasil dihapus",
        data,
      });
    } catch (error) {
      res.status(500).json({
        message: "Terjadi error",
        error: error.message,
      });
    }
  },
};
