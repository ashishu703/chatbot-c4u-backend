


class HttpException extends Error
{
    status;

    constructor(message, statusCode)
    {
        super(message)
        this.status = statusCode;
    }

    
}

module.exports = HttpException;