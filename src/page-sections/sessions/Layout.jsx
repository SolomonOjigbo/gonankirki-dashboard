import { Fragment } from "react";
import { Grid, Box, Divider } from "@mui/material"; // CUSTOM COMPONENTS

import { H3, H6, Paragraph } from "components/typography";
import { FlexRowAlign } from "components/flexbox"; // =========================================================================

// =========================================================================
const Layout = ({
  children,
  login
}) => {
  return <Grid container height="100%">
      <Grid item md={6} xs={12}>
        <FlexRowAlign bgcolor="primary.main" height="100%">
          <Box color="white" p={6} maxWidth={700}>
            {login ? <H3 fontWeight={600}>Hi, Welcome Back!</H3> : <Fragment>
                <Box width={80} alt="quickframe" component="img" src="/static/logo/logo.png" />

                <H3 mt={3} fontWeight={600} maxWidth={450}>
                  Register New Admin/BDSP User Account
                </H3>

                <Divider sx={{
              borderColor: "primary.400",
              borderWidth: 1,
              my: 3
            }} />
              </Fragment>}

            <Box my={4}>
              <H6 fontSize={20}>Gonankirki Dashboard</H6>
              <Paragraph>
                Transparent Farming
              </Paragraph>
            </Box>
              <Paragraph>
                Our Project Sponsors & Partners
              </Paragraph>
            <img src="/static/footer-brands.svg" alt="footer" />
          </Box>
        </FlexRowAlign>
      </Grid>

      <Grid item md={6} xs={12}>
        <FlexRowAlign bgcolor="background.paper" height="100%">
          {children}
        </FlexRowAlign>
      </Grid>
    </Grid>;
};

export default Layout;