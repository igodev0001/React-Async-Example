import {
  FormErrorMessage,
  FormLabel,
  FormControl,
  Text,
  Input,
  Image,
  Button,
  Flex,
  Box,
  Center,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
} from "@chakra-ui/react";
import { useGetUserDetails } from "./hooks/useGetUserDetails";

import { useForm } from "react-hook-form";
import axios from "axios";
import { useState, useEffect } from "react";

type FormValues = {
  name: string;
  age: number;
  avatar: string;
};

type ExpFormValues = {
  startDate: string;
  endDate: string;
  jobTitle: string;
  company: string;
  companyLogo: string;
  jobDescription: string;
};


export const UserProfile = () => {
  const [userData, setUserData] = useState<any>({
    id: -1,
    name: "",
    avatar: "",
    age: null,
    workExperiences: null,
  });

  let lastID = -1;

  //when goes online mode, we post data to server in localStorage data
  const doPost = async (index, item) => {
    
    lastID = await axios
        .get("http://localhost:4000/user")
        .then((res) => {  return res.data.id;}); // Get Last user id to save experience
    //if localstorage data is user
    if(item.type == "user") {
      const formData = new FormData();
      //change base64 code to File Object
      const file = await fetch(item.data.avatar)
      .then(res => res.blob())
      .then(blob => {
        return new File([blob], "File name",{ type: "image/png" })
      })
      formData.append("file", file);

      //Upload File and get uploaded filename
      const fileName = await axios.post("http://localhost:4000/uploadFile",formData).then(res=>{ return res.data;}).catch(error => {
          if(error.toJSON().message === 'Network Error'){
            return "Network Error";
          }
          return "Error";
      });
      if(fileName == "Network Error") {
        return;
      }
      //save user data
      await axios.post("http://localhost:4000/user/submit", { data:item.data.data, avatar:fileName});
      
      //remove user data from localstorage
      const item1 = localStorage.getItem("offline_data");
      const arrayItem = JSON.parse(item1);
      arrayItem.splice(index, 1);
      localStorage.setItem("offline_data", JSON.stringify(arrayItem));
      //get last ID
      lastID = await axios
        .get("http://localhost:4000/user")
        .then((res) => {  return res.data.id;}); 
     
    }
    //if item type is experience
    if(item.type == "experience") {
     
      //if user is not existed remove offlinedata - these are junk items
      if(lastID == -1) {
        const item1 = localStorage.getItem("offline_data");
        const arrayItem = JSON.parse(item1);
        arrayItem.splice(index, 1);
        localStorage.setItem("offline_data", JSON.stringify(arrayItem));
        return;
      };

      //convert base64 data to File object
      const formData = new FormData();
      const file = await fetch(item.data.companyLogo)
      .then(res => res.blob())
      .then(blob => {
        return new File([blob], "File name",{ type: "image/png" })
      })
      formData.append("file", file);
      //Upload File and get uploaded filename
      const fileName = await axios.post("http://localhost:4000/uploadFile",formData).then(res=>{ return res.data;}).catch(error => {
          if(error.toJSON().message === 'Network Error'){
            return "Network Error";
          }
          return "Error";
      });
      if(fileName == "Network Error") {
        return;
      }
      
      //save experience data
      await axios.post("http://localhost:4000/experience/submit", { data:JSON.stringify({...JSON.parse(item.data.data), user_id:lastID}) , companyLogo:fileName});
      //remove user data from localstorage
      const item1 = localStorage.getItem("offline_data");
      const arrayItem = JSON.parse(item1);
      arrayItem.splice(index, 1);
      localStorage.setItem("offline_data", JSON.stringify(arrayItem));
    }
  }
  useEffect(() => {
    //get and set last user.
    axios
      .get("http://localhost:4000/user")
      .then((res) => setUserData(res.data));
    return () => {
        //check if offline data is exist on localstorage
        if(localStorage.getItem("offline_data")) {
      
          const item = localStorage.getItem("offline_data");
          const arrayItem = JSON.parse(item);
          //if server is alive, then start to send offline data
          axios.get("http://localhost:4000/isAlive").then( async res => {
            let index = 0;
            //call doPost for items in localstorage
            for(let item of arrayItem) {
                await doPost(index,item)
                index++;
            }
           
          }).catch(error => {
              if(error.toJSON().message === 'Network Error'){
                return "Network Error";
              }
              return "Error";
          });
        
      }
    }
    
  }, []);

  //isOpen and isExpOpen are used to show/hide Modal
  const [isOpen, setOpen] = useState(false);
  const [isExpOpen, setExpOpen] = useState(false);

  const [picture, setPicture] = useState(null);

  //isSubmitting. isExpSubmit is used for clicking submit button
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isExpSubmit, setExpSubmit] = useState<boolean>(false);

  //avatar, companyImage data
  const [imgData, setImgData] = useState(null);
  const [companyImgData, setCompanyImgData] = useState(null);

  //This is used for test click
  const handleSend = async (e) => {
    e.preventDefault();
    await axios
      .post("http://localhost:4000/user/create", {
        name: "james",
      })
      .then((res) => {
        console.log(res.data);
      });
  };

  //when click change avatar
  const onChangePicture = (e) => {
    if (e.target.files[0]) {
      console.log("picture: ", e.target.files);
      setPicture(e.target.files[0]);
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImgData(reader.result);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  //when click change company picture
  const onChangeCompanyPicture = (e) => {
    if (e.target.files[0]) {
      console.log("picture: ", e.target.files);
      setPicture(e.target.files[0]);
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setCompanyImgData(reader.result);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormValues>();

  const {
    handleSubmit: handleSubmit2,
    register: register2,
    formState: { errors: errors2 },
    getValues,

  } = useForm<ExpFormValues>();

  //we save offline data to localstorage if server is dead
  const setOfflineData = (type, data) => {
    let item = localStorage.getItem("offline_data");
    let arrayitem = [];
    if(item) {
      arrayitem = JSON.parse(item);
    }
    if(type == "user") {
      arrayitem.push({
        type:"user",
        data: data,
      })
    }
    else {
      arrayitem.push({
        type:"experience",
        data: data,
      })
    }
    localStorage.setItem("offline_data", JSON.stringify(arrayitem));
    
  }
  //when click experience submit button
  const handleExpSubmit = async (values) => {
    
    setExpSubmit(true);
    const data = JSON.stringify({ ...values, user_id: userData.id });

    const formData = new FormData();
    formData.append("file", values.companyLogo[0] as File);

    //upload file to server when server is alive
    const fileName = await axios.post("http://localhost:4000/uploadFile",formData).then(res=>{ return res.data;}).catch(error => {
        if(error.toJSON().message === 'Network Error'){
          return "Network Error";
        }
        return "Error";
    });
    if(fileName == "Network Error") {
      //if server is dead then save it to localstorage
      var reader = new FileReader()
      reader.readAsDataURL(values.companyLogo[0] as File);
      reader.onload = function(base64) {
        setOfflineData("experience",{
          companyLogo: reader.result,
          data:JSON.stringify({...values})
        })
      }
      setExpSubmit(false);
      return;
    }
    //save experience to db
    await axios.post(
      "http://localhost:4000/experience/submit",
      { data, companyLogo:fileName }
    );
    setExpSubmit(false);
    axios
      .get("http://localhost:4000/user")
      .then((res) => setUserData(res.data));
  };
  const onSubmit = async (values) => {
    setIsSubmitting(true);
    const data = JSON.stringify(values);
    const formData = new FormData();
    formData.append("file", values.avatar[0] as File);
    //upload files and get filename
    const fileName = await axios.post("http://localhost:4000/uploadFile",formData).then(res=>{ return res.data;}).catch(error => {
        if(error.toJSON().message === 'Network Error'){
          return "Network Error";
        }
        return "Error";
    });
    if(fileName == "Network Error") {
      //if server is dead, save data to localstorage
      var reader = new FileReader()
      reader.readAsDataURL(values.avatar[0] as File);
      reader.onload = function(base64) {
        setOfflineData("user",{
          avatar: reader.result,
          data:data
        })
      }
      
      
      setIsSubmitting(false);
      return;
    }
    //save user data to db
    await axios.post("http://localhost:4000/user/submit", 
      {data,avatar:fileName});
    return new Promise((resolve) => {
      axios
        .get("http://localhost:4000/user")
        .then((res) => setUserData(res.data));
      setIsSubmitting(false);
    });
  };

  //when click remove button
  const removeExperience = async (id) => {
    //remove experience by id
    await axios.post(
      "http://localhost:4000/experience/remove",
      { id }
    );
    axios
        .get("http://localhost:4000/user")
        .then((res) => setUserData(res.data));
  }
  return (
    <Center>
      <Box
        borderRadius="20px"
        h="100%"
        border="1px solid #E2E8F0"
        shadow="md"
        w="fit-content"
        bg="#F7F7F7"
      >
        <Stack maxW="sm" p={10}>
          <Text fontSize="3xl">User Profile</Text>
          <Button
            color="teal"
            onClick={() => {
              setOpen(true);
            }}
          >
            Add Profile
          </Button>

          <Modal isOpen={isOpen} onClose={() => setOpen(false)}>
            <ModalOverlay />
            <ModalContent>
              <ModalCloseButton />
              <ModalBody>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <FormControl>
                    <FormLabel htmlFor="name">First name</FormLabel>
                    <Input
                      id="name"
                      placeholder="name"
                      {...register("name", {
                        required: true,
                        minLength: {
                          value: 4,
                          message: "Minimum length should be 4",
                        },
                        pattern: {
                          value:/^([^0-9]*)$/,// check if input data is only string.
                          message:"Numbers are not allowed."
                        },
                        maxLength: 30,
                      })}
                    />
                    <Text variant="danger">
                      {errors.name && errors?.name.message}
                    </Text>
                  </FormControl>
                  <FormControl>
                    <FormLabel htmlFor="age">Age</FormLabel>
                    <Input
                      id="age"
                      placeholder="age"
                      {...register("age", {
                        required: "This is required",
                        pattern: {
                          value:/^([0-9]\d*)$/, // check if input data is digit
                          message:"Numbers are required."
                        },
                        validate: (value) => value > 0,
                      })}
                    />
                    <Text variant="danger">
                      {errors.age && errors.age.message}
                    </Text>
                  </FormControl>
                  <Flex>
                    <Box>
                      <Image src={imgData} />
                    </Box>

                    <FormControl>
                      <FormLabel htmlFor="avatar">Profile Picture</FormLabel>
                      <Input
                        type="file"
                        {...register("avatar")}
                        onChange={onChangePicture}
                      />
                      <Text variant="danger">
                        {errors.avatar && errors.avatar.message}
                      </Text>
                    </FormControl>
                  </Flex>

                  <Button
                    mt={4}
                    colorScheme="teal"
                    isLoading={isSubmitting}
                    type="submit"
                  >
                    Submit
                  </Button>
                </form>
              </ModalBody>
            </ModalContent>
          </Modal>

          <Box>
            <FormControl>
              <FormLabel>First Name:{userData.name}</FormLabel>
            </FormControl>
            <FormControl>
              <FormLabel>Age:{userData.age}</FormLabel>
            </FormControl>
            <FormControl>
              <FormLabel>Profile Picture</FormLabel>
              <FormLabel>
                <img src={"http://localhost:4000/public/upload/" + `${userData.avatar}`} />
              </FormLabel>
            </FormControl>
          </Box>

          <Button
            color="teal"
            onClick={() => {
              setExpOpen(true);
            }}
          >
            Add Experience
          </Button>
          <Modal isOpen={isExpOpen} onClose={() => setExpOpen(false)}>
            <ModalOverlay />
            <ModalContent>
              <ModalCloseButton />
              <ModalBody>
                <Box pt={5}>
                  Work Experience
                  <form onSubmit={handleSubmit2(handleExpSubmit)}>
                    <FormControl>
                      <FormLabel htmlFor="startDate">Start Date</FormLabel>
                      <Input
                        id="startDate"
                        placeholder="startDate"
                        type="date"
                        {...register2("startDate", {
                          valueAsDate: true,
                        })}
                      />
                      <Text variant="danger">
                        {errors2.startDate && errors2.startDate.message}
                      </Text>
                    </FormControl>
                    <FormControl>
                      <FormLabel htmlFor="endDate">End Date</FormLabel>
                      <Input
                        id="endDate"
                        placeholder="endDate"
                        type="date"
                        {...register2("endDate", {
                          validate:{
                            biggerThan: v => v > getValues("startDate")|| "Should be greater than Start Date",
                          },
                          valueAsDate: true,
                        })}
                      />
                      <Text variant="danger">
                        {errors2.endDate && errors2.endDate.message}
                      </Text>
                    </FormControl>
                    <FormControl>
                      <FormLabel htmlFor="jobTitle">Job Title</FormLabel>
                      <Input
                        id="jobTitle"
                        placeholder="jobTitle"
                        {...register2("jobTitle", {
                          required: "This is required",
                          minLength: {
                            value: 4,
                            message: "Minimum length should be 10",
                          },
                        })}
                      />
                      <Text variant="danger">
                        {errors2.jobTitle && errors2.jobTitle.message}
                      </Text>
                    </FormControl>
                    <FormControl>
                      <FormLabel htmlFor="company">Company</FormLabel>
                      <Input
                        id="company"
                        placeholder="company"
                        {...register2("company", {
                          required: "This is required",
                          minLength: {
                            value: 4,
                            message: "Minimum length should be 4",
                          },
                        })}
                      />{" "}
                      <Text variant="danger">
                        {errors2.company && errors2.company.message}
                      </Text>
                    </FormControl>
                    <Flex>
                      <Box>
                        <Image src={companyImgData} />

                        <FormControl>
                          <FormLabel htmlFor="companyLogo">
                            Company Logo
                          </FormLabel>
                          <Input
                            type="file"
                            {...register2("companyLogo")}
                            onChange={onChangeCompanyPicture}
                          />
                          <Text variant="danger">
                            {errors2.companyLogo && errors2.companyLogo.message}
                          </Text>
                        </FormControl>
                      </Box>
                    </Flex>
                    <FormControl>
                      <FormLabel htmlFor="jobDescription">
                        Job Description
                      </FormLabel>
                      <Input
                        id="jobDescription"
                        placeholder="jobDescription"
                        {...register2("jobDescription", {
                          required: "This is required",
                          minLength: {
                            value: 4,
                            message: "Minimum length should be 4",
                          },
                          maxLength: {
                            value: 250,
                            message: "Maximum length should be 250",
                          },
                        })}
                      />
                      <Text variant="danger">
                        {errors2.jobDescription &&
                          errors2.jobDescription.message}
                      </Text>
                    </FormControl>
                    <Button
                      mt={4}
                      colorScheme="teal"
                      isLoading={isExpSubmit}
                      type="submit"
                    >
                      Submit
                    </Button>
                  </form>
                </Box>
              </ModalBody>
            </ModalContent>
          </Modal>
          <Box>
            Work Experiences
            {userData.workExperiences &&
              userData.workExperiences.map((item, index) => (
                <div key={index}>
                  <FormControl>
                    <FormLabel>Start Date:{item.startDate}</FormLabel>
                  </FormControl>
                  <FormControl>
                    <FormLabel>End Date:{item.endDate}</FormLabel>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Job Title:{item.jobTitle}</FormLabel>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Company:{item.company}</FormLabel>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Job Description:{item.jobDescription}</FormLabel>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Company Logo</FormLabel>
                    <FormLabel>
                      <img src={"http://localhost:4000/public/upload/" + `${item.companyLogo}`} />
                    </FormLabel>
                  </FormControl>
                  <Button
                    color="teal"
                    onClick={() => { removeExperience(item.id) }}
                  >
                    Remove
                  </Button>
                  <hr />
                </div>
              ))}
          </Box>

          <Button onClick={(e) => handleSend(e)}>test</Button>
        </Stack>
      </Box>
    </Center>
  );
};
