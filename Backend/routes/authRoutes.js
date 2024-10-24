// const express = require("express");
// const {
//   userSignUp,
//   verifyUser,
//   userSignIn,
//   userLogout,
//   forgotPassword,
//   changePassword,
//   forgotPassVerify,
//   isAuthenticated,
// } = require("../controller/authController");
// const { authMiddleware } = require("../middleware/auth-middleware");
// const authRouter = express.Router();
// authRouter.route("/signup").post(userSignUp);
// authRouter.route("/verify").post(verifyUser);
// authRouter.route("/signin").post(userSignIn);
// authRouter.route("/logout").get(userLogout);
// authRouter.route("/resetPass").post(forgotPassword);
// authRouter.route("/resetPassVerify").post(forgotPassVerify);
// authRouter.route("/changePass").post(authMiddleware, changePassword);
// authRouter.route("/isAuth").get(isAuthenticated);
// module.exports = authRouter;
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/signup", authController.userSignUp);
router.post("/verify", authController.verifyUser);
router.post("/login", authController.userSignIn);
router.post("/logout", authController.userLogout);

module.exports = router;
