import mongoose from "mongoose";
import Inquiry from "../models/inquiry.models.js";
import Listing from "../models/listing.models.js";
import User from "../models/user.models.js";
import { errorHandler } from "../utils/error.js";
import { Resend } from "resend";

// =====================================================
// HTML ESCAPE HELPER
// =====================================================

const escapeHtml = (value = "") => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// =====================================================
// CREATE INQUIRY
// Customer -> PrimePlaceEstate Admin
// =====================================================

export const createInquiry = async (req, res, next) => {
  try {
    console.log("==========================================");
    console.log("📩 CREATE INQUIRY REQUEST");
    console.log("==========================================");

    // -------------------------------------------------
    // CHECK RESEND API KEY
    // -------------------------------------------------

    if (!process.env.RESEND_API_KEY) {
      console.error(
        "❌ RESEND_API_KEY is missing"
      );

      return res.status(500).json({
        success: false,
        message:
          "Email service is not configured.",
        emailSent: false,
      });
    }

    // -------------------------------------------------
    // CREATE RESEND INSTANCE
    // -------------------------------------------------

    const resend = new Resend(
      process.env.RESEND_API_KEY
    );

    // -------------------------------------------------
    // GET USER
    // -------------------------------------------------

    const senderId =
      req.user?.id || req.user?._id;

    const { listingId } = req.params;

    const {
      name,
      email,
      phone,
      message,
    } = req.body;

    // -------------------------------------------------
    // AUTHENTICATION
    // -------------------------------------------------

    if (!senderId) {
      return next(
        errorHandler(
          401,
          "You must be signed in to contact us."
        )
      );
    }

    // -------------------------------------------------
    // VALIDATE SENDER ID
    // -------------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        senderId
      )
    ) {
      return next(
        errorHandler(
          401,
          "Invalid user authentication."
        )
      );
    }

    const senderObjectId =
      new mongoose.Types.ObjectId(
        senderId
      );

    // -------------------------------------------------
    // VALIDATE LISTING ID
    // -------------------------------------------------

    if (!listingId) {
      return next(
        errorHandler(
          400,
          "Listing ID is required."
        )
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        listingId
      )
    ) {
      return next(
        errorHandler(
          400,
          "Invalid listing ID."
        )
      );
    }

    // -------------------------------------------------
    // VALIDATE FORM
    // -------------------------------------------------

    if (
      !name?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !message?.trim()
    ) {
      return next(
        errorHandler(
          400,
          "Name, email, cell number and message are required."
        )
      );
    }

    // -------------------------------------------------
    // CLEAN FORM DATA
    // -------------------------------------------------

    const cleanName =
      name.trim();

    const cleanEmail =
      email.trim().toLowerCase();

    const cleanPhone =
      phone.trim();

    const cleanMessage =
      message.trim();

    // -------------------------------------------------
    // VALIDATE EMAIL
    // -------------------------------------------------

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return next(
        errorHandler(
          400,
          "Please provide a valid email address."
        )
      );
    }

    // -------------------------------------------------
    // FIND LISTING
    // -------------------------------------------------

    const listing =
      await Listing.findById(listingId);

    if (!listing) {
      return next(
        errorHandler(
          404,
          "Property not found."
        )
      );
    }

    console.log(
      "🏠 Property:",
      listing.name
    );

    // -------------------------------------------------
    // OWNER ID
    // -------------------------------------------------

    let ownerObjectId = null;

    if (
      listing.userRef &&
      mongoose.Types.ObjectId.isValid(
        listing.userRef
      )
    ) {
      ownerObjectId =
        new mongoose.Types.ObjectId(
          listing.userRef
        );
    }

    // -------------------------------------------------
    // PREVENT SELF INQUIRY
    // -------------------------------------------------

    if (
      ownerObjectId &&
      ownerObjectId.toString() ===
        senderObjectId.toString()
    ) {
      return next(
        errorHandler(
          400,
          "You cannot send an inquiry to yourself."
        )
      );
    }

    // -------------------------------------------------
    // CREATE INQUIRY DATA
    // -------------------------------------------------

    const inquiryData = {
      listingId:
        listing._id,

      senderId:
        senderObjectId,

      name:
        cleanName,

      email:
        cleanEmail,

      phone:
        cleanPhone,

      message:
        cleanMessage,

      status:
        "new",
    };

    // Add ownerId only when available

    if (ownerObjectId) {
      inquiryData.ownerId =
        ownerObjectId;
    }

    // -------------------------------------------------
    // SAVE INQUIRY
    // -------------------------------------------------

    const inquiry =
      await Inquiry.create(
        inquiryData
      );

    console.log(
      "=========================================="
    );

    console.log(
      "✅ INQUIRY SAVED:",
      inquiry._id
    );

    console.log(
      "👤 Customer:",
      cleanName
    );

    console.log(
      "📧 Customer Email:",
      cleanEmail
    );

    console.log(
      "📱 Customer Phone:",
      cleanPhone
    );

    console.log(
      "🏠 Property:",
      listing.name
    );

    console.log(
      "=========================================="
    );

    // -------------------------------------------------
    // ESCAPE HTML
    // -------------------------------------------------

    const safeName =
      escapeHtml(cleanName);

    const safeEmail =
      escapeHtml(cleanEmail);

    const safePhone =
      escapeHtml(cleanPhone);

    const safeMessage =
      escapeHtml(
        cleanMessage
      ).replace(
        /\n/g,
        "<br />"
      );

    const safeListingName =
      escapeHtml(
        listing.name ||
          "Property Listing"
      );

    const safeAddress =
      escapeHtml(
        listing.address ||
          "Address not provided"
      );

    // -------------------------------------------------
    // RECEIVING EMAIL
    // -------------------------------------------------

    const receiverEmail =
      process.env.INQUIRY_RECEIVER_EMAIL ||
      "tsepkhoza266@gmail.com";

    // -------------------------------------------------
    // FROM EMAIL
    // -------------------------------------------------

    const fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      process.env.EMAIL_FROM ||
      "onboarding@resend.dev";

    console.log(
      "📨 EMAIL CONFIGURATION"
    );

    console.log(
      "From:",
      fromEmail
    );

    console.log(
      "To:",
      receiverEmail
    );

    console.log(
      "Reply-To:",
      cleanEmail
    );

    console.log(
      "API KEY LOADED:",
      Boolean(
        process.env.RESEND_API_KEY
      )
    );

    // -------------------------------------------------
    // SEND EMAIL
    // -------------------------------------------------

    try {
      console.log(
        "=========================================="
      );

      console.log(
        "📧 SENDING INQUIRY EMAIL..."
      );

      console.log(
        "=========================================="
      );

      const result =
        await resend.emails.send({
          from:
            fromEmail,

          to: [
            receiverEmail,
          ],

          replyTo:
            cleanEmail,

          subject:
            `New Property Inquiry - ${listing.name}`,

          html: `
            <!DOCTYPE html>

            <html>

              <head>

                <meta charset="UTF-8" />

                <meta
                  name="viewport"
                  content="width=device-width, initial-scale=1.0"
                />

                <title>
                  New Property Inquiry
                </title>

              </head>

              <body
                style="
                  margin: 0;
                  padding: 0;
                  background-color: #f1f5f9;
                  font-family: Arial, Helvetica, sans-serif;
                "
              >

                <div
                  style="
                    max-width: 650px;
                    margin: 40px auto;
                    padding: 20px;
                  "
                >

                  <!-- HEADER -->

                  <div
                    style="
                      background-color: #166534;
                      padding: 30px;
                      border-radius: 16px 16px 0 0;
                      color: white;
                    "
                  >

                    <h1
                      style="
                        margin: 0;
                        font-size: 26px;
                      "
                    >
                      New Property Inquiry
                    </h1>

                    <p
                      style="
                        margin: 8px 0 0;
                        font-size: 15px;
                      "
                    >
                      PrimePlaceEstate
                    </p>

                  </div>

                  <!-- CONTENT -->

                  <div
                    style="
                      background-color: white;
                      padding: 30px;
                      border-radius: 0 0 16px 16px;
                    "
                  >

                    <!-- PROPERTY -->

                    <h2
                      style="
                        margin-top: 0;
                        color: #111827;
                        font-size: 22px;
                      "
                    >
                      ${safeListingName}
                    </h2>

                    <p
                      style="
                        color: #6b7280;
                        font-size: 15px;
                      "
                    >
                      📍 ${safeAddress}
                    </p>

                    <hr
                      style="
                        border: none;
                        border-top: 1px solid #e5e7eb;
                        margin: 25px 0;
                      "
                    />

                    <!-- CUSTOMER -->

                    <h3
                      style="
                        color: #111827;
                        margin-bottom: 15px;
                      "
                    >
                      Customer Details
                    </h3>

                    <p
                      style="
                        color: #374151;
                        margin: 8px 0;
                      "
                    >
                      <strong>
                        Name:
                      </strong>

                      ${safeName}
                    </p>

                    <p
                      style="
                        color: #374151;
                        margin: 8px 0;
                      "
                    >
                      <strong>
                        Email:
                      </strong>

                      ${safeEmail}
                    </p>

                    <p
                      style="
                        color: #374151;
                        margin: 8px 0;
                      "
                    >
                      <strong>
                        Cell Number:
                      </strong>

                      ${safePhone}
                    </p>

                    <!-- MESSAGE -->

                    <h3
                      style="
                        color: #111827;
                        margin-top: 30px;
                        margin-bottom: 15px;
                      "
                    >
                      Message
                    </h3>

                    <div
                      style="
                        background-color: #f8fafc;
                        border: 1px solid #e5e7eb;
                        padding: 20px;
                        border-radius: 10px;
                        color: #374151;
                        line-height: 1.7;
                      "
                    >
                      ${safeMessage}
                    </div>

                    <!-- REPLY -->

                    <div
                      style="
                        margin-top: 30px;
                        padding: 18px;
                        background-color: #ecfdf5;
                        border-left: 4px solid #16a34a;
                        border-radius: 8px;
                      "
                    >

                      <p
                        style="
                          margin: 0;
                          color: #166534;
                          line-height: 1.6;
                        "
                      >

                        <strong>
                          Reply to the customer
                        </strong>

                        <br />

                        Click
                        <strong>
                          Reply
                        </strong>
                        in your email to respond
                        directly to
                        ${safeName}.

                      </p>

                    </div>

                    <!-- FOOTER -->

                    <p
                      style="
                        margin-top: 35px;
                        margin-bottom: 0;
                        text-align: center;
                        color: #9ca3af;
                        font-size: 12px;
                      "
                    >
                      This inquiry was submitted through
                      PrimePlaceEstate.
                    </p>

                  </div>

                </div>

              </body>

            </html>
          `,
        });

      // -------------------------------------------------
      // LOG COMPLETE RESEND RESPONSE
      // -------------------------------------------------

      console.log(
        "📨 COMPLETE RESEND RESPONSE:"
      );

      console.dir(
        result,
        {
          depth: null,
        }
      );

      // -------------------------------------------------
      // RESEND RETURNED ERROR
      // -------------------------------------------------

      if (result?.error) {
        console.error(
          "=========================================="
        );

        console.error(
          "❌ RESEND REJECTED EMAIL"
        );

        console.error(
          "Error name:",
          result.error.name
        );

        console.error(
          "Error message:",
          result.error.message
        );

        console.error(
          "Error status:",
          result.error.statusCode
        );

        console.error(
          "Full error:"
        );

        console.dir(
          result.error,
          {
            depth: null,
          }
        );

        console.error(
          "=========================================="
        );

        return res.status(502).json({
          success: false,

          message:
            result.error.message ||
            "Your inquiry was saved, but the email could not be sent.",

          inquiry,

          emailSent:
            false,

          emailError:
            result.error.message ||
            "Resend rejected the email.",
        });
      }

      // -------------------------------------------------
      // CHECK EMAIL ID
      // -------------------------------------------------

      const emailId =
        result?.data?.id ||
        result?.id ||
        null;

      if (!emailId) {
        console.error(
          "❌ RESEND DID NOT RETURN AN EMAIL ID"
        );

        return res.status(502).json({
          success: false,

          message:
            "Your inquiry was saved, but the email could not be confirmed as sent.",

          inquiry,

          emailSent:
            false,

          emailError:
            "Resend did not return an email ID.",
        });
      }

      // -------------------------------------------------
      // EMAIL SUCCESS
      // -------------------------------------------------

      console.log(
        "=========================================="
      );

      console.log(
        "✅ INQUIRY EMAIL SENT SUCCESSFULLY"
      );

      console.log(
        "📧 Sent to:",
        receiverEmail
      );

      console.log(
        "↩️ Reply-To:",
        cleanEmail
      );

      console.log(
        "📨 Email ID:",
        emailId
      );

      console.log(
        "=========================================="
      );

      return res.status(201).json({
        success:
          true,

        message:
          "Your inquiry has been sent successfully!",

        inquiry,

        emailSent:
          true,

        emailId:
          emailId,
      });

    } catch (emailError) {
      // -------------------------------------------------
      // RESEND EXCEPTION
      // -------------------------------------------------

      console.error(
        "=========================================="
      );

      console.error(
        "❌ RESEND EMAIL EXCEPTION"
      );

      console.error(
        "=========================================="
      );

      console.error(
        "Message:",
        emailError?.message
      );

      console.error(
        "Name:",
        emailError?.name
      );

      console.error(
        "Status:",
        emailError?.statusCode
      );

      console.error(
        "Full error:"
      );

      console.dir(
        emailError,
        {
          depth: null,
        }
      );

      console.error(
        "=========================================="
      );

      return res.status(502).json({
        success:
          false,

        message:
          emailError?.message ||
          "Your inquiry was saved, but the email could not be sent.",

        inquiry,

        emailSent:
          false,

        emailError:
          emailError?.message ||
          "Email delivery failed.",
      });
    }

  } catch (error) {
    console.error(
      "❌ CREATE INQUIRY ERROR:",
      error
    );

    next(error);
  }
};

// =====================================================
// GET RECEIVED INQUIRIES
// =====================================================

export const getReceivedInquiries = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      req.user?.id ||
      req.user?._id;

    if (!userId) {
      return next(
        errorHandler(
          401,
          "You must be signed in."
        )
      );
    }

    const inquiries =
      await Inquiry.find({
        ownerId:
          userId,
      })
        .populate(
          "listingId",
          "name address imageUrls"
        )
        .populate(
          "senderId",
          "username email phone"
        )
        .sort({
          createdAt:
            -1,
        });

    return res.status(200).json({
      success:
        true,

      inquiries:
        inquiries,
    });

  } catch (error) {
    console.error(
      "❌ GET RECEIVED INQUIRIES ERROR:",
      error
    );

    next(error);
  }
};

// =====================================================
// GET SENT INQUIRIES
// =====================================================

export const getSentInquiries = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      req.user?.id ||
      req.user?._id;

    if (!userId) {
      return next(
        errorHandler(
          401,
          "You must be signed in."
        )
      );
    }

    const inquiries =
      await Inquiry.find({
        senderId:
          userId,
      })
        .populate(
          "listingId",
          "name address imageUrls"
        )
        .populate(
          "ownerId",
          "username email"
        )
        .sort({
          createdAt:
            -1,
        });

    return res.status(200).json({
      success:
        true,

      inquiries:
        inquiries,
    });

  } catch (error) {
    console.error(
      "❌ GET SENT INQUIRIES ERROR:",
      error
    );

    next(error);
  }
};

// =====================================================
// UPDATE INQUIRY STATUS
// =====================================================

export const updateInquiryStatus = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      req.user?.id ||
      req.user?._id;

    const { id } =
      req.params;

    const { status } =
      req.body;

    if (!userId) {
      return next(
        errorHandler(
          401,
          "You must be signed in."
        )
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return next(
        errorHandler(
          400,
          "Invalid inquiry ID."
        )
      );
    }

    const allowedStatuses = [
      "new",
      "read",
      "replied",
      "archived",
    ];

    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      return next(
        errorHandler(
          400,
          "Invalid inquiry status."
        )
      );
    }

    const inquiry =
      await Inquiry.findById(id);

    if (!inquiry) {
      return next(
        errorHandler(
          404,
          "Inquiry not found."
        )
      );
    }

    const isOwner =
      inquiry.ownerId &&
      inquiry.ownerId.toString() ===
        userId.toString();

    const isSender =
      inquiry.senderId &&
      inquiry.senderId.toString() ===
        userId.toString();

    const isAdmin =
      req.user?.role ===
      "admin";

    if (
      !isOwner &&
      !isSender &&
      !isAdmin
    ) {
      return next(
        errorHandler(
          403,
          "You are not authorized to update this inquiry."
        )
      );
    }

    inquiry.status =
      status;

    await inquiry.save();

    return res.status(200).json({
      success:
        true,

      message:
        "Inquiry status updated successfully.",

      inquiry:
        inquiry,
    });

  } catch (error) {
    console.error(
      "❌ UPDATE INQUIRY STATUS ERROR:",
      error
    );

    next(error);
  }
};

// =====================================================
// DELETE INQUIRY
// =====================================================

export const deleteInquiry = async (
  req,
  res,
  next
) => {
  try {
    const userId =
      req.user?.id ||
      req.user?._id;

    const { id } =
      req.params;

    if (!userId) {
      return next(
        errorHandler(
          401,
          "You must be signed in."
        )
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return next(
        errorHandler(
          400,
          "Invalid inquiry ID."
        )
      );
    }

    const inquiry =
      await Inquiry.findById(id);

    if (!inquiry) {
      return next(
        errorHandler(
          404,
          "Inquiry not found."
        )
      );
    }

    const isOwner =
      inquiry.ownerId &&
      inquiry.ownerId.toString() ===
        userId.toString();

    const isSender =
      inquiry.senderId &&
      inquiry.senderId.toString() ===
        userId.toString();

    const isAdmin =
      req.user?.role ===
      "admin";

    if (
      !isOwner &&
      !isSender &&
      !isAdmin
    ) {
      return next(
        errorHandler(
          403,
          "You are not authorized to delete this inquiry."
        )
      );
    }

    await Inquiry.findByIdAndDelete(
      id
    );

    return res.status(200).json({
      success:
        true,

      message:
        "Inquiry deleted successfully.",
    });

  } catch (error) {
    console.error(
      "❌ DELETE INQUIRY ERROR:",
      error
    );

    next(error);
  }
};

// =====================================================
// REPLY TO INQUIRY
// Admin/Property Owner -> Customer
// =====================================================

// =====================================================
// REPLY TO INQUIRY
// Admin/Property Owner -> Customer
// =====================================================

export const replyToInquiry = async (
  req,
  res,
  next
) => {
  try {
    // -------------------------------------------------
    // CHECK RESEND
    // -------------------------------------------------

    if (!process.env.RESEND_API_KEY) {
      return next(
        errorHandler(
          500,
          "Email service is not configured."
        )
      );
    }

    const resend =
      new Resend(
        process.env.RESEND_API_KEY
      );

    // -------------------------------------------------
    // USER
    // -------------------------------------------------

    const userId =
      req.user?.id ||
      req.user?._id;

    // IMPORTANT:
    // Your route is:
    // /reply/:inquiryId
    //
    // Therefore we MUST use inquiryId here.
    const { inquiryId } =
      req.params;

    const { message } =
      req.body;

    console.log(
      "=========================================="
    );

    console.log(
      "📩 REPLY TO INQUIRY REQUEST"
    );

    console.log(
      "req.params:",
      req.params
    );

    console.log(
      "inquiryId:",
      inquiryId
    );

    console.log(
      "userId:",
      userId
    );

    console.log(
      "=========================================="
    );

    // -------------------------------------------------
    // AUTHENTICATION
    // -------------------------------------------------

    if (!userId) {
      return next(
        errorHandler(
          401,
          "You must be signed in."
        )
      );
    }

    // -------------------------------------------------
    // VALIDATE INQUIRY ID
    // -------------------------------------------------

    if (
      !inquiryId ||
      !mongoose.Types.ObjectId.isValid(
        inquiryId
      )
    ) {
      console.error(
        "❌ INVALID INQUIRY ID:",
        inquiryId
      );

      return next(
        errorHandler(
          400,
          "Invalid inquiry ID."
        )
      );
    }

    // -------------------------------------------------
    // VALIDATE MESSAGE
    // -------------------------------------------------

    if (!message?.trim()) {
      return next(
        errorHandler(
          400,
          "Reply message is required."
        )
      );
    }

    const cleanReply =
      message.trim();

    // -------------------------------------------------
    // FIND INQUIRY
    // -------------------------------------------------

    const inquiry =
      await Inquiry.findById(
        inquiryId
      )
        .populate(
          "listingId",
          "name address imageUrls"
        )
        .populate(
          "senderId",
          "username email"
        )
        .populate(
          "ownerId",
          "username email"
        );

    if (!inquiry) {
      return next(
        errorHandler(
          404,
          "Inquiry not found."
        )
      );
    }

    console.log(
      "✅ INQUIRY FOUND:",
      inquiry._id
    );

    // -------------------------------------------------
    // AUTHORIZATION
    // -------------------------------------------------

    const isOwner =
      inquiry.ownerId &&
      inquiry.ownerId._id &&
      inquiry.ownerId._id.toString() ===
        userId.toString();

    const isAdmin =
      req.user?.role ===
      "admin";

    console.log(
      "👤 User ID:",
      userId
    );

    console.log(
      "👑 Is Admin:",
      isAdmin
    );

    console.log(
      "🏠 Is Owner:",
      isOwner
    );

    if (
      !isOwner &&
      !isAdmin
    ) {
      return next(
        errorHandler(
          403,
          "You are not authorized to reply to this inquiry."
        )
      );
    }

    // -------------------------------------------------
    // CUSTOMER EMAIL
    // -------------------------------------------------

    const customerEmail =
      inquiry.email ||
      inquiry.senderId?.email;

    if (!customerEmail) {
      return next(
        errorHandler(
          400,
          "Customer email address is not available."
        )
      );
    }

    // -------------------------------------------------
    // SENDER EMAIL
    // -------------------------------------------------

    const senderEmail =
      process.env.INQUIRY_RECEIVER_EMAIL ||
      "tsepkhoza266@gmail.com";

    const fromEmail =
      process.env.RESEND_FROM_EMAIL ||
      process.env.EMAIL_FROM ||
      "onboarding@resend.dev";

    // -------------------------------------------------
    // PROPERTY
    // -------------------------------------------------

    const propertyName =
      inquiry.listingId?.name ||
      "Property Listing";

    // -------------------------------------------------
    // ESCAPE CUSTOMER NAME
    // -------------------------------------------------

    const safeCustomerName =
      escapeHtml(
        inquiry.name ||
          inquiry.senderId?.username ||
          "Customer"
      );

    // -------------------------------------------------
    // ESCAPE PROPERTY
    // -------------------------------------------------

    const safePropertyName =
      escapeHtml(
        propertyName
      );

    // -------------------------------------------------
    // ESCAPE REPLY
    // -------------------------------------------------

    const safeReply =
      escapeHtml(
        cleanReply
      ).replace(
        /\n/g,
        "<br />"
      );

    // -------------------------------------------------
    // LOG EMAIL INFORMATION
    // -------------------------------------------------

    console.log(
      "=========================================="
    );

    console.log(
      "📧 PREPARING REPLY EMAIL"
    );

    console.log(
      "Customer:",
      customerEmail
    );

    console.log(
      "From:",
      fromEmail
    );

    console.log(
      "Reply-To:",
      senderEmail
    );

    console.log(
      "Property:",
      propertyName
    );

    console.log(
      "=========================================="
    );

    // -------------------------------------------------
    // SEND REPLY EMAIL
    // -------------------------------------------------

    const result =
      await resend.emails.send({
        from:
          fromEmail,

        to: [
          customerEmail,
        ],

        replyTo:
          senderEmail,

        subject:
          `Re: Property Inquiry - ${propertyName}`,

        html: `
          <!DOCTYPE html>

          <html>

            <head>

              <meta charset="UTF-8" />

              <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
              />

              <title>
                PrimePlaceEstate Reply
              </title>

            </head>

            <body
              style="
                margin: 0;
                padding: 0;
                background-color: #f1f5f9;
                font-family: Arial, Helvetica, sans-serif;
              "
            >

              <div
                style="
                  max-width: 650px;
                  margin: 40px auto;
                  padding: 20px;
                "
              >

                <div
                  style="
                    background-color: #166534;
                    padding: 30px;
                    border-radius: 16px 16px 0 0;
                    color: white;
                  "
                >

                  <h1
                    style="
                      margin: 0;
                      font-size: 25px;
                    "
                  >
                    PrimePlaceEstate
                  </h1>

                  <p>
                    Reply to your property inquiry
                  </p>

                </div>

                <div
                  style="
                    background-color: white;
                    padding: 30px;
                    border-radius: 0 0 16px 16px;
                  "
                >

                  <p
                    style="
                      color: #374151;
                      font-size: 16px;
                    "
                  >
                    Hello ${safeCustomerName},
                  </p>

                  <p
                    style="
                      color: #374151;
                      line-height: 1.6;
                    "
                  >
                    Thank you for your inquiry
                    regarding:
                  </p>

                  <div
                    style="
                      background-color: #f8fafc;
                      border: 1px solid #e5e7eb;
                      padding: 18px;
                      border-radius: 10px;
                      margin: 20px 0;
                    "
                  >

                    <strong>
                      ${safePropertyName}
                    </strong>

                  </div>

                  <h3>
                    Reply
                  </h3>

                  <div
                    style="
                      background-color: #f8fafc;
                      border: 1px solid #e5e7eb;
                      padding: 20px;
                      border-radius: 10px;
                      color: #374151;
                      line-height: 1.7;
                    "
                  >
                    ${safeReply}
                  </div>

                  <p
                    style="
                      margin-top: 30px;
                      color: #374151;
                    "
                  >
                    Regards,
                    <br />

                    <strong>
                      PrimePlaceEstate
                    </strong>
                  </p>

                </div>

              </div>

            </body>

          </html>
        `,
      });

    // -------------------------------------------------
    // CHECK RESEND ERROR
    // -------------------------------------------------

    if (result?.error) {
      console.error(
        "=========================================="
      );

      console.error(
        "❌ RESEND REPLY ERROR"
      );

      console.error(
        "Name:",
        result.error.name
      );

      console.error(
        "Message:",
        result.error.message
      );

      console.error(
        "Status:",
        result.error.statusCode
      );

      console.dir(
        result.error,
        {
          depth: null,
        }
      );

      console.error(
        "=========================================="
      );

      return res.status(502).json({
        success:
          false,

        message:
          result.error.message ||
          "Reply could not be sent.",

        emailSent:
          false,

        emailError:
          result.error.message ||
          "Email delivery failed.",
      });
    }

    // -------------------------------------------------
    // EMAIL ID
    // -------------------------------------------------

    const emailId =
      result?.data?.id ||
      result?.id ||
      null;

    if (!emailId) {
      console.error(
        "❌ RESEND DID NOT RETURN EMAIL ID"
      );

      return res.status(502).json({
        success:
          false,

        message:
          "Reply could not be confirmed as sent.",

        emailSent:
          false,

        emailError:
          "Resend did not return an email ID.",
      });
    }

    // -------------------------------------------------
    // MARK INQUIRY AS REPLIED
    // -------------------------------------------------

    inquiry.status =
      "replied";

    await inquiry.save();

    // -------------------------------------------------
    // SUCCESS
    // -------------------------------------------------

    console.log(
      "=========================================="
    );

    console.log(
      "✅ REPLY EMAIL SENT SUCCESSFULLY"
    );

    console.log(
      "Inquiry ID:",
      inquiry._id
    );

    console.log(
      "Customer:",
      customerEmail
    );

    console.log(
      "Email ID:",
      emailId
    );

    console.log(
      "=========================================="
    );

    return res.status(200).json({
      success:
        true,

      message:
        "Reply sent successfully.",

      emailSent:
        true,

      emailId:
        emailId,

      inquiry:
        inquiry,
    });

  } catch (error) {
    console.error(
      "=========================================="
    );

    console.error(
      "❌ REPLY TO INQUIRY ERROR"
    );

    console.error(
      error
    );

    console.error(
      "=========================================="
    );

    next(error);
  }
};

