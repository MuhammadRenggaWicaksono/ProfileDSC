export async function response(statusCode:number, status:boolean, message:string, data:object) {
   return Response.json({
        status,
        message,
        data
    }, {status: statusCode})
}

export async function serverErrorResponse(statusCode:number, status:boolean, message:string) {
    return Response.json({
        status,
        message,
    }, {status: statusCode})
}