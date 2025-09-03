const router = require("express").Router();
const validateUser = require("../middlewares/user.middleware.js");
const validateAgent = require("../middlewares/agent.middleware.js");
const AuthController = require("../controllers/MessangerAuthController.js");
const MessengerWebhookController = require("../controllers/MessengerWebhookController.js");
const MessengerChatController = require("../controllers/MessengerChatController.js");
const FacebookPageController = require("../controllers/FacebookPageController.js");
const FacebookCommentController = require("../controllers/FacebookCommentController.js");
const FacebookPostController = require("../controllers/FacebookPostController.js");
const authController = new AuthController();
const messengerWebhookController = new MessengerWebhookController();
const messengerChatController = new MessengerChatController();
const facebookPageController = new FacebookPageController();
const facebookCommentController = new FacebookCommentController();
const facebookPostController = new FacebookPostController();


router.post(
  "/auth-init",
  validateUser,
  authController.initiateUserAuth.bind(authController)
);

router.get(
  "/webhook",
  messengerWebhookController.verifyWebhook.bind(messengerWebhookController)
);

router.post(
  "/webhook",
  messengerWebhookController.handleWebhook.bind(messengerWebhookController)
);

router.post(
  "/send",
  validateUser,
  messengerChatController.send.bind(messengerChatController)
);

router.post(
  "/send-image",
  validateUser,
  messengerChatController.sendImage.bind(messengerChatController)
);

router.post(
  "/send-video",
  validateUser,
  messengerChatController.sendVideo.bind(messengerChatController)
);

router.post(
  "/send-doc",
  validateUser,
  messengerChatController.sendDoc.bind(messengerChatController)
);

router.post(
  "/send-audio",
  validateUser,
  messengerChatController.sendAudio.bind(messengerChatController)
);

router.post(
  "/send-agent-message",
  validateAgent,
  messengerChatController.send.bind(messengerChatController)
);

router.post(
  "/send-agent-image",
  validateAgent,
  messengerChatController.sendImage.bind(messengerChatController)
);

router.post(
  "/send-agent-video",
  validateAgent,
  messengerChatController.sendVideo.bind(messengerChatController)
);

router.post(
  "/send-agent-doc",
  validateAgent,
  messengerChatController.sendDoc.bind(messengerChatController)
);

router.post(
  "/send-agent-audio",
  validateAgent,
  messengerChatController.sendAudio.bind(messengerChatController)
);

router.get(
  "/accounts",
  validateUser,
  authController.getAccounts.bind(authController)
);

router.get(
  "/pages",
  validateUser,
  facebookPageController.getPages.bind(facebookPageController)
);


router.post(
  "/pages",
  validateUser,
  facebookPageController.activatePages.bind(facebookPageController)
);

router.post(
  "/discard-inactive-pages",
  validateUser,
  facebookPageController.discardInactivePages.bind(facebookPageController)
);

router.delete(
  "/accounts/:id",
  validateUser,
  authController.deleteAccount.bind(authController)
);

router.delete(
  "/pages/:id",
  validateUser,
  facebookPageController.deletePage.bind(facebookPageController)
);

router.post(
  "/pages/:pageId/fetch-posts-comments",
  validateUser,
  facebookPageController.fetchPostsAndCommentsForPage.bind(facebookPageController)
);

router.post(
  "/pages/fetch-all-posts-comments",
  validateUser,
  facebookPageController.fetchPostsAndCommentsForAllPages.bind(facebookPageController)
);

// Facebook Post Routes
router.get(
  "/posts/page/:pageId",
  validateUser,
  facebookPostController.getPostsByPage.bind(facebookPostController)
);

router.post(
  "/posts/fetch/page/:pageId",
  validateUser,
  facebookPostController.fetchPostsForPage.bind(facebookPostController)
);

router.post(
  "/posts/fetch/all",
  validateUser,
  facebookPostController.fetchAllPostsAndComments.bind(facebookPostController)
);

// Facebook Comment Routes
router.get(
  "/comments/page/:pageId",
  validateUser,
  facebookCommentController.getCommentsByPage.bind(facebookCommentController)
);

router.get(
  "/comments/post/:postId",
  validateUser,
  facebookCommentController.getCommentsByPost.bind(facebookCommentController)
);

router.get(
  "/comments/account/:socialAccountId",
  validateUser,
  facebookCommentController.getCommentsBySocialAccount.bind(facebookCommentController)
);

router.put(
  "/comments/:commentId/status",
  validateUser,
  facebookCommentController.updateCommentStatus.bind(facebookCommentController)
);

router.get(
  "/comments/page/:pageId/count",
  validateUser,
  facebookCommentController.getCommentsCount.bind(facebookCommentController)
);

// Test route to verify comment functionality
router.get(
  "/comments/test",
  validateUser,
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "Facebook comment routes are working",
      availableEndpoints: [
        "GET /comments/page/:pageId",
        "GET /comments/post/:postId", 
        "GET /comments/account/:socialAccountId",
        "PUT /comments/:commentId/status",
        "GET /comments/page/:pageId/count"
      ]
    });
  }
);



// Webhook subscription route to subscribe pages to feed field for comments
router.post(
  "/webhook/subscribe/:pageId",
  validateUser,
  async (req, res) => {
    try {
      const { pageId } = req.params;
      const user = req.decode;
      
      // Get the page from your database
      const page = await facebookPageController.pageRepository.findFirst({
        where: { page_id: pageId, uid: user.uid }
      });
      
      if (!page) {
        return res.status(404).json({ success: false, message: "Page not found" });
      }
      
      // Use the existing method from MessengerPageApi
      const MessengerPageApi = require("../api/Messanger/MessengerPageApi.js");
      const messengerPageApi = new MessengerPageApi(user, page.token);
      await messengerPageApi.initMeta();
      
      const result = await messengerPageApi.subscribeWebhooks(pageId);
      
      return res.json({
        success: true,
        message: "Successfully subscribed to webhook fields including feed for comments",
        data: result
      });
      
    } catch (error) {
      console.error("Error subscribing to webhooks:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

module.exports = router;
