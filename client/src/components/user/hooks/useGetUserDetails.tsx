import { useEffect, useState } from "react";
import axios from "axios";
import { User } from "../types";

export const useGetUserDetails = async () => {
    let returnData = null;
    const d = await axios.get("http://localhost:4000/user");
    returnData = d.data;
    return returnData;
};
