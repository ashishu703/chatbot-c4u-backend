module.exports = class CustomExceptionMessages {
  static getMessages(type) {
    return {
      CustomException: {
        message: "An error occurred",
        statusCode: 500,
      },
      FacebookException: {
        message: "An error occurred with Facebook",
        statusCode: 500,
      },
      TwitterException: {
        message: "An error occurred with Twitter",
        statusCode: 500,
      },
      GoogleException: {
        message: "An error occurred with Google",
        statusCode: 500,
      },
      PasswordNotProvidedException: {
        message: "Please provide a password",
        statusCode: 401,
      },
      InvalidCredentialsException: {
            message: "Invalid credentials",
            statusCode: 401,
        },
        FillAllFieldsException: {
            message: "Please fill all fields",
            statusCode: 400,
        },
        InvalidRequestException: {
            message: "Invalid request",
            statusCode: 400,
        },
        
        NotEnoughInputProvidedException: {
            message: "Not enough input provided",
            statusCode: 400,
        },
        NoFilesWereUploadedException: {
            message: "No files were uploaded",
            statusCode: 400,
        },
        TypeCommentException: {
            message: "Please type your comment",
            statusCode: 400,
        },
        ApiKeysNotFoundException: {
            message: "API keys not found",
            statusCode: 400,
        },
        MessageObjectKeyIsRequiredException: {
            message: "messageObject key is required as body response",
            statusCode: 400,
        },
        ProvideSendToKeyException: {
            message: "Please provide `sendTo` key",
            statusCode: 400,
        },
        ProvideTempletNameException: {
            message: "Please provide `templetName`",
            statusCode: 400,
        },
        ProvideExampleArrArrayException: {
            message: "Please provide `exampleArr` array",
            statusCode: 400,
        },
        TokenMissingOrInvalidExecption: {
            message: "Token is missing or invalid",
            statusCode: 400,
        },
        TokenMalformedExecption: {
            message: "Token is malformed",
            statusCode: 400,
        },
        InvalidPhonebookException: {
            message: "Invalid phonebook provided",
            statusCode: 400,
        },
        UrlAndTypeRequiredException: {
            message: "Url and type are required",
            statusCode: 400,
        },
       TypeTagException:{
         message: "Please type a tag",
            statusCode: 400,
       },
       FlowIdException: {
         message: "Flow id missing",
         statusCode: 400,
       },
       UidRequiredException: {
         message: "Uid is required",
         statusCode: 400,
       },
       UserNotFoundException: {
         message: "User not found or invalid user data",
         statusCode: 404,
       },
       AdminNotFoundException: {
         message: "Admin not found or invalid admin data",
         statusCode: 404,
       },
       ProvideTemplateException: {
         message: "Please provide template",
         statusCode: 400,
       },
       MobileNumberRequiredException: {
         message: "Mobile number is required",
         statusCode: 400,
       },
       UidandPlanRequiredException: {
         message: "UID and valid plan data required",
         statusCode: 400,
       },



    }[type];
  }
};
