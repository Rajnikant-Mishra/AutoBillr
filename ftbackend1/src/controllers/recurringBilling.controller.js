import RecurringBilling from "../models/RecurringBilling.model.js";

export const createRecurringBilling = async (
  req,
  res
) => {
  try {
    const recurring =
      await RecurringBilling.create(
        req.body
      );

    res.status(201).json({
      success: true,
      recurring,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getRecurringBillings =
  async (req, res) => {
    try {
      const recurring =
        await RecurringBilling.find()
          .populate("client")
          .populate("project");

      res.status(200).json({
        success: true,
        recurring,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };