const { __t } = require("./../utils/locale.utils");

module.exports = class CustomExceptionMessages {
  static getMessages(type) {
    return {
      CustomException: {
        message: __t("an_error_occurred"),
        statusCode: 500,
      },
      FacebookException: {
        message: __t("facebook_error"),
        statusCode: 500,
      },
      TwitterException: {
        message: __t("twitter_error"),
        statusCode: 500,
      },
      GoogleException: {
        message:__t("google_error"),
        statusCode: 500,
      },
      PasswordNotProvidedException: {
        message:__t("provide_password"),
        statusCode: 401,
      },
      InvalidCredentialsException: {
        message:__t("invalid_credentials"),
        statusCode: 401,
      },
      FillAllFieldsException: {
        message:__t("fill_all_fields"),
        statusCode: 400,
      },
      InvalidRequestException: {
        message:__t("invalid_request"),
        statusCode: 400,
      },

      NotEnoughInputProvidedException: {
        message:__t("not_enough_input"), 
        statusCode: 400,
      },
      NoFilesWereUploadedException: {
        message:__t("no_files_uploaded"), 
        statusCode: 400,
      },
      TypeCommentException: {
        message:__t("type_your_comment"), 
        statusCode: 400,
      },
      ApiKeysNotFoundException: {
        message:__t("api_keys_not_found"), 
        statusCode: 400,
      },
      MessageObjectKeyIsRequiredException: {
        message:__t("message_object_key_required"), 
        statusCode: 400,
      },
      ProvideSendToKeyException: {
        message:__t("provide_send_to_key"), 
        statusCode: 400,
      },
      ProvideTempletNameException: {
        message:__t("provide_templet_name"), 
        statusCode: 400,
      },
      ProvideExampleArrArrayException: {
        message:__t("provide_example_arr"),
        statusCode: 400,
      },
      TokenMissingOrInvalidExecption: {
        message:__t("token_missing_or_invalid"),
        statusCode: 400,
      },
      TokenMalformedExecption: {
        message:__t("token_malformed"),
        statusCode: 400,
      },
      InvalidPhonebookException: {
        message:__t("invalid_phonebook"),
        statusCode: 400,
      },
      UrlAndTypeRequiredException: {
        message:__t("url_and_type_required"),
        statusCode: 400,
      },
      TypeTagException: {
        message:__t("type_a_tag"),
        statusCode: 400,
      },
      FlowIdException: {
        message:__t("flow_id_missing"),
        statusCode: 400,
      },
      UidRequiredException: {
        message:__t("uid_required"),
        statusCode: 400,
      },
      UserNotFoundException: {
        message:__t("user_not_found_or_invalid"),
        statusCode: 404,
      },
      AdminNotFoundException: {
        message:__t("admin_not_found_or_invalid"),
        statusCode: 404,
      },
      ProvideTemplateException: {
        message:__t("provide_template"),
        statusCode: 400,
      },
      MobileNumberRequiredException: {
        message:__t("mobile_number_required"),
        statusCode: 400,
      },
      UidandPlanRequiredException: {
        message:__t("uid_and_valid_plan_required"),
        statusCode: 400,
      },
      EnterPhonebookNameException: {
        message:__t("enter_phonebook_name"),
        statusCode: 400,
      },
    }[type];
  }
};
