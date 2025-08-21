declare module "mongoose-sequence" {
  import { Connection } from "mongoose";

  function autoIncrement(connection: Connection): any;

  export default autoIncrement;
}
