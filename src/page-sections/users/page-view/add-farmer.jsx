"use client";

import {
  Box,
  Button,
  Card,
  Grid,
  IconButton,
  styled,
  Switch,
  TextField,
  MenuItem,
  Select,
  Stack,
  Chip,
  OutlinedInput,
  InputLabel
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Paragraph } from "components/typography";
import { FlexBetween, FlexRowAlign } from "components/flexbox";
import { format } from "date-fns";
import { isDark } from "utils/constants";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getAuth } from "firebase/auth";
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { AuthContext } from "contexts/firebaseContext";
import { useContext } from "react";


const SwitchWrapper = styled(FlexBetween)({
  width: "100%",
  marginTop: 10
});
const StyledCard = styled(Card)({
  padding: 24,
  minHeight: 400,
  display: "flex",
  alignItems: "center",
  flexDirection: "column"
});
const ButtonWrapper = styled(FlexRowAlign)(({
  theme
}) => ({
  width: 100,
  height: 100,
  borderRadius: "50%",
  backgroundColor: theme.palette.grey[isDark(theme) ? 700 : 100]
}));
const UploadButton = styled(FlexRowAlign)(({
  theme
}) => ({
  width: 50,
  height: 50,
  borderRadius: "50%",
  backgroundColor: theme.palette.grey[isDark(theme) ? 600 : 200],
  border: `1px solid ${theme.palette.background.paper}`
}));

const cropOptions = [
  { label: 'Ginger', value: 'Ginger' },
  { label: 'Sesame', value: 'Sesame' },
  { label: 'Cashew Nuts', value: 'Cashew Nuts' },
  { label: 'Hibiscus', value: 'Hibiscus' },
  { label: 'Others', value: 'Others' },
];

const AddNewUserPageView = () => {
  const { user, db } = useContext(AuthContext);

  const initialValues = {
    fullName: "",
    email: "",
    phone: "",
    state: "",
    city: "",
    address: "",
    cropsProduced: [],
  };

  const validationSchema = Yup.object().shape({
    fullName: Yup.string().required("Name is Required!"),
    email: Yup.string().email().required("Email is Required!"),
    phone: Yup.string().min(8, 'Phone must be at least 8 characters').required("Phone is Required!"),
    state: Yup.string().required("State is Required!"),
    city: Yup.string().required("City is Required!"),
    address: Yup.string().required("Address is Required!"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values)=>{handleSubmitForm(values)}
  });

  const {
    values,
    errors,
    handleChange,
    setFieldValue,
    handleSubmit,
    touched
  } = formik;

  const handleSubmitForm = async (values) => {
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

    const userId = user.id;
    console.log(`User ${userId}`);
    const farmersRef = collection(db, 'users', userId, 'farmers');

    try {
      const existingFarmers = await getDocs(
        query(
          farmersRef,
          where('farmerPhoneNumber', '==', values.phone),
        ),
      );

      if (!existingFarmers.empty) {
        toast.error('Farmer with this phone number already exists');
        return;
      }

      await addDoc(farmersRef, {
        farmerLocation: values.state,
        city_town: values.city,
        farmerName: values.fullName,
        farmerPhoneNumber: values.phone,
        farmerAddress: values.address,
        cropsProduced: values.cropsProduced,
        farmerEmail: values.email,
        registeredBy: userId,
        dateRegistered: format(new Date(), 'dd/MM/yyyy'),
      });

      toast.success('Farmer registered successfully! Thank you!');

    } catch (error) {
      console.error('Error adding document: ', error);
      toast.error('Failed to Submit Form');
    }
  };

  return (
    <Box pt={2} pb={4}>
      <Grid container spacing={3}>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <Grid item md={4} xs={12}>
          <StyledCard>
            <ButtonWrapper>
              <UploadButton>
                <label htmlFor="upload-btn">
                  <input accept="image/*" id="upload-btn" type="file" style={{ display: "none" }} />
                  <IconButton component="span">
                    <PhotoCamera sx={{ fontSize: 26, color: "grey.400" }} />
                  </IconButton>
                </label>
              </UploadButton>
            </ButtonWrapper>

            <Paragraph marginTop={2} maxWidth={200} display="block" textAlign="center" color="text.secondary">
              Allowed *.jpeg, *.jpg, *.png, *.gif max size of 3.1 MB
            </Paragraph>

            <Box maxWidth={250} marginTop={5} marginBottom={1}>
              <SwitchWrapper>
                <Paragraph display="block" fontWeight={600}>
                  Public Profile
                </Paragraph>
                <Switch defaultChecked />
              </SwitchWrapper>
            </Box>
          </StyledCard>
        </Grid>
        <Grid item md={8} xs={12}>
          <Card sx={{ padding: 3 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {[
                  { name: 'fullName', label: 'Full Name' },
                  { name: 'email', label: 'Email Address' },
                  { name: 'phone', label: 'Phone Number' },
                  { name: 'state', label: 'State/Location' },
                  { name: 'city', label: 'City/Town' },
                ].map((field, index) => (
                  <Grid item sm={6} xs={12} key={index}>
                    <TextField
                      fullWidth
                      name={field.name}
                      label={field.label}
                      value={values[field.name]}
                      onChange={handleChange}
                      helperText={touched[field.name] && errors[field.name]}
                      error={Boolean(touched[field.name] && errors[field.name])}
                    />
                  </Grid>
                ))}

                <Grid item sm={6} xs={12}>
                  <InputLabel id="cropsProduced">Crops Produced</InputLabel>
                  <Select
                    multiple
                    fullWidth
                    id="cropsProduced"
                    value={values.cropsProduced}
                    name="cropsProduced"
                    onChange={event => setFieldValue('cropsProduced', event.target.value)}
                    input={<OutlinedInput label="Crops Produced" />}
                    renderValue={(selected) => (
                      <Stack gap={1} direction="row" flexWrap="wrap">
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Stack>
                    )}
                  >
                    {cropOptions.map((crop, index) => (
                      <MenuItem key={index} value={crop.value}>
                        {crop.label}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    multiline
                    fullWidth
                    rows={6}
                    name="address"
                    label="Address"
                    value={values.address}
                    onChange={handleChange}
                    helperText={touched.address && errors.address}
                    error={Boolean(touched.address && errors.address)}
                    sx={{ "& .MuiOutlinedInput-root textarea": { padding: 0 } }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button type="submit" variant="contained">
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AddNewUserPageView;
