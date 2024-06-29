class ErrrorHandler extends Error{
    constructor(message,statusCode){
        super(message);
        this.statusCode=statusCode;
       
    }
}

export {ErrrorHandler};