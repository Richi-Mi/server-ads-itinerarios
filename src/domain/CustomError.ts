export class CustomError extends Error{
    constructor(
        public message: string, 
        public statusCode: number
    ){
        super(message);
        this.name = "CustomError";
    }

    public toResponse() : { message: string } {
        return { message: this.message }
    }
}