import { UserData } from "../../src/model/userModel";

declare global{
    namespace Express{
        interface Request{
            user:UserData
        }
    }
}