const { __t } = require("../utils/locale.utils");

module.exports = class CustomExceptionMessages {
  static getMessages(type) {
    return {
      CustomException: {
        message: __t("an_error_occurred"),
        statusCode: 500,
      },
      ApiException: {
        message: __t("api_error"),
        statusCode: 500,
      },
      TwitterException: {
        message: __t("twitter_error"),
        statusCode: 500,
      },
      GoogleException: {
        message: __t("google_error"),
        statusCode: 500,
      },
      PasswordNotProvidedException: {
        message: __t("provide_password"),
        statusCode: 401,
      },
      InvalidCredentialsException: {
        message: __t("invalid_credentials"),
        statusCode: 401,
      },
      FillAllFieldsException: {
        message: __t("fill_all_fields"),
        statusCode: 400,
      },
      InvalidRequestException: {
        message: __t("invalid_request"),
        statusCode: 400,
      },

      NotEnoughInputProvidedException: {
        message: __t("not_enough_input"),
        statusCode: 400,
      },
      NoFilesWereUploadedException: {
        message: __t("no_files_uploaded"),
        statusCode: 400,
      },
      TypeCommentException: {
        message: __t("type_your_comment"),
        statusCode: 400,
      },
      ApiKeysNotFoundException: {
        message: __t("api_keys_not_found"),
        statusCode: 400,
      },
      MessageObjectKeyIsRequiredException: {
        message: __t("message_object_key_required"),
        statusCode: 400,
      },
      ProvideSendToKeyException: {
        message: __t("provide_send_to_key"),
        statusCode: 400,
      },
      ProvideTempletNameException: {
        message: __t("provide_templet_name"),
        statusCode: 400,
      },
      ProvideExampleArrArrayException: {
        message: __t("provide_example_arr"),
        statusCode: 400,
      },
      TokenMissingOrInvalidExecption: {
        message: __t("token_missing_or_invalid"),
        statusCode: 400,
      },
      TokenMalformedExecption: {
        message: __t("token_malformed"),
        statusCode: 400,
      },
      InvalidPhonebookException: {
        message: __t("invalid_phonebook"),
        statusCode: 400,
      },
      UrlAndTypeRequiredException: {
        message: __t("url_and_type_required"),
        statusCode: 400,
      },
      TypeTagException: {
        message: __t("type_a_tag"),
        statusCode: 400,
      },
      FlowIdException: {
        message: __t("flow_id_missing"),
        statusCode: 400,
      },
      UidRequiredException: {
        message: __t("uid_required"),
        statusCode: 400,
      },
      UserNotFoundException: {
        message: __t("user_not_found_or_invalid"),
        statusCode: 404,
      },
      AdminNotFoundException: {
        message: __t("admin_not_found_or_invalid"),
        statusCode: 404,
      },
      ProvideTemplateException: {
        message: __t("provide_template"),
        statusCode: 400,
      },
      MobileNumberRequiredException: {
        message: __t("mobile_number_required"),
        statusCode: 400,
      },
      UidandPlanRequiredException: {
        message: __t("uid_and_valid_plan_required"),
        statusCode: 400,
      },
      EnterPhonebookNameException: {
        message: __t("enter_phonebook_name"),
        statusCode: 400,
      },
      AuthenticationFailedException: {
        message: __t("authentication_failed"),
        statusCode: 403,
      },
      EmailAlreadyInUseException: {
        message: __t("email_already_in_use"),
        statusCode: 409,
      },
      AgentNotFoundException: {
        message: __t("agent_not_found"),
        statusCode: 404,
      },
      TokenExpiredEXception: {
        message: __t("token_expired"),
        statusCode: 401,
      },
      TokenVerificationFailedException: {
        message: __t("token_verification_failed"),
        statusCode: 401,
      },
      LoginInputMissingException: {
        message: __t("login_input_missing"),
        statusCode: 400,
      },
      FacebookAppCredentialsMissingException: {
        message: __t("facebook_app_credentials_missing"),
        statusCode: 400,
      },
      FacebookLoginParamMismatchException: {
        message: __t("facebook_login_param_mismatch"),
        statusCode: 400,
      },
      InvalidLoginTokenException: {
        message: __t("invalid_login_token"),
        statusCode: 400,
      },
      GoogleLoginFailedException: {
        message: __t("google_login_failed"),
        statusCode: 400,
      },
      PrivacyTermsUncheckedException: {
        message: __t("privacy_terms_unchecked"),
        statusCode: 400,
      },
      RecoveryUserNotFoundException: {
        message: __t("recovery_user_not_found_exception"),
        statusCode: 200,
      },
      SmtpConnectionNotFoundException: {
        message: __t("smtp_connection_not_found"),
        statusCode: 500,
      },
      PasswordRequiredException: {
        message: __t("password_required"),
        statusCode: 400,
      },
      MetaApiKeysNotfoundException: {
        message: __t("meta_api_keys_not_found"),
        statusCode: 400,
      },
      PhonebookNoMobileException: {
        message: __t("phonebook_no_mobile"),
        statusCode: 400,
      },
      MetaKeysOrTokenInvalid: {
        message: __t("meta_keys_or_token_invalid"),
        statusCode: 400,
      },
      PlanNoChatbotPermissionException: {
        message: __t("plan_no_chatbot_permission"),
        statusCode: 400,
      },
      FlowNotfoundException: {
        message: __t("flow_not_found_exception"),
        statusCode: 404,
      },
      ChatNotFoundException: {
        message: __t("chat_not_found"),
        statusCode: 404,
      },
      LogoRequiredException: {
        message: __t("logo_required"),
        statusCode: 400,
      },
      InvalidEmailIdException: {
        message: __t("invalid_email_id"),
        statusCode: 400,
      },
      IdRequiredException: {
        message: __t("id_required"),
        statusCode: 400,
      },
      UserIdRequiredException: {
        message: __t("user_id_required"),
        statusCode: 400,
      },
      UserPlanExpiredException: {
        message: __t("user_plan_expired"),
        statusCode: 400,
      },
      PhoneIdMismatchException: {
        message: __t("phone_id_mismatch"),
        statusCode: 400,
      },
      TokenNotVerifiedException: {
        message: __t("token_not_verified"),
        statusCode: 400,
      },
      RoomNotFoundException: {
        message: __t("room_not_found"),
        statusCode: 400,
      },
      InvalidTemplateDataException: {
        message: __t("invalid_template_data"),
        statusCode: 400,
      },
      InvalidMessageTypeException: {
        message: __t("invalid_message_type"),
        statusCode: 400,
      },
      CheckMetaApiKeysException: {
        message: __t("check_meta_api_keys"),
        statusCode: 400,
      },
      CheckApiException: {
        message: __t("check_api"),
        statusCode: 400,
      },
      CheckYourDetailsException: {
        message: __t("check_your_details"),
        statusCode: 400,
      },
      FillMetaApiKeysException: {
        message: __t("fill_meta_api_keys"),
        statusCode: 400,
      },
      TemplateCreationFailedException: {
        message: __t("template_creation_failed"),
        statusCode: 400,
      },
      TemplateNameRequiredException: {
        message: __t("template_name_required"),
        statusCode: 400,
      },
      UploadSessionFailedException: {
        message: __t("upload_session_failed"),
        statusCode: 400,
      },
      CheckMetaApiException: {
        message: __t("check_meta_api"),
        statusCode: 400,
      },
      PaymentDetailsNotFoundException: {
        message: __t("payment_details_not_found"),
        statusCode: 400,
      },
      PaymentKeysNotFoundException: {
        message: __t("payment_keys_not_found"),
        statusCode: 400,
      },
      PlanNotFoundWithIdException: {
        message: __t("plan_not_found_with_id"),
        statusCode: 400,
      },
      InvalidPlanFoundException: {
        message: __t("invalid_plan_found"),
        statusCode: 400,
      },
      FillRazorpayCredentialsException: {
        message: __t("fill_razorpay_credentials"),
        statusCode: 400,
      },
      OrderIdAndPlanRequiredException: {
        message: __t("order_id_and_plan_required"),
        statusCode: 400,
      },
      PaypalCredentialsRequiredException: {
        message: __t("paypal_credentials_required"),
        statusCode: 400,
      },
      PaymentProcessingErrorException: {
        message: __t("payment_processing_error"),
        statusCode: 400,
      },
      TrialAlreadyTakenException: {
        message: __t("trial_already_taken"),
        statusCode: 400,
      },
      NotATrialPlanException: {
        message: __t("not_a_trial_plan"),
        statusCode: 400,
      },
      DuplicatePhonebookNameException: {
        message: __t("duplicate_phonebook_name"),
        statusCode: 409,
      },
      InvalidCsvProvidedException: {
        message: __t("invalid_csv_provided"),
        statusCode: 400,
      },
      CsvMobileMissingException: {
        message: __t("csv_mobile_missing"),
        statusCode: 400,
      },
      InvalidUidOrPlanException: {
        message: __t("invalid_uid_or_plan"),
        statusCode: 400,
      },
      ThemeSettingErrorException: {
        message: __t("theme_setting_error"),
        statusCode: 400,
      },
      DestinationFileExistsException: {
        message: __t("destination_file_exists"),
        statusCode: 400,
      },
      CannotDeleteAllLanguagesException: {
        message: __t("cannot_delete_all_languages"),
        statusCode: 400,
      },
      EmailAlreadyTakenException: {
        message: __t("email_already_taken"),
        statusCode: 400,
      },
      ContactNotFoundInPhonebookException: {
        message: __t("contact_not_found_in_phonebook"),
        statusCode: 400,
      },
      ContactAlreadyExistedException: {
        message: __t("contact_already_existed"),
        statusCode: 400,
      },
      PleaseSelectAgentException: {
        message: __t("please_select_agent"),
        statusCode: 400,
      },
      TaskNotFoundOrUnauthorizedException: {
        message: __t("task_not_found_or_unauthorized"),
        statusCode: 400,
      },
      CannotRemoveAgentDetailException: {
        message: __t("cannot_remove_agent_detail"),
        statusCode: 400,
      },
      PleaseProvideAppNameException: {
        message: __t("please_provide_app_name"),
        statusCode: 400,
      },
      WebConfigNotFoundException: {
        message: __t("web_config_not_found"),
        statusCode: 400,
      },
      ProfileNotFoundException: {
        message: __t("profile_not_found"),
        statusCode: 400,
      },
      PageNotFoundException: {
        message: __t("page_not_found"),
        statusCode: 400,
      },
      CredentialsNotProvided: {
        message: __t("credentials_not_provided"),
        statusCode: 400,
      },
      UserAlreadyExistException: {
        message: __t("user_already_exists"),
        statusCode: 401,
      },
      ChatDisabledException: {
        message: __t("chat_disabled"),
        statusCode: 401,
      },
      InvalidPlanIdException:{
        message:__t("invalid_plan_id"),
        statusCode:400,
      },
      StripeSecretKeyIsMissing:{
        message:__t("stripe_secret_key_is_missing"),
        statusCode:400,
      }
    }[type];
  }
};
