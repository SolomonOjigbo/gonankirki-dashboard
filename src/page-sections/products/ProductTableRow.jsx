"use client"

import { useEffect, useState } from "react";
import { Avatar, Box, Checkbox, Chip, TableCell, TableRow } from "@mui/material";
import { DeleteOutline, Edit, RemoveRedEye } from "@mui/icons-material";
import { format } from "date-fns"; // CUSTOM COMPONENTS

import { FlexBox } from "components/flexbox";
import { Paragraph } from "components/typography";
import { TableMoreMenuItem, TableMoreMenu } from "components/table"; // CUSTOM DEFINED HOOK

import useFetchUsers from "hooks/useFetchUsers";
import useNavigate from "hooks/useNavigate"; // ==============================================================

// ==============================================================
const ProductTableRow = ({
  product,
  isSelected,
  handleSelectRow,
  handleDeleteProduct
}) => {
  const navigate = useNavigate();
  const [openMenuEl, setOpenMenuEl] = useState(null);
  const { getBDSPUser, loading } = useFetchUsers();
  const [bdspUser, setBDSPUser] = useState(null);
  const userId = product.userId;

  useEffect(() => {
    if (userId) {
      const fetchedUser = getBDSPUser(userId);
      setBDSPUser(fetchedUser);
      console.log("BDSP:", bdspUser)
    }
  }, [userId, getBDSPUser]);


  const handleOpenMenu = event => {
    setOpenMenuEl(event.currentTarget);
  };

  const handleCloseOpenMenu = () => setOpenMenuEl(null);

  return <TableRow hover>
      <TableCell padding="checkbox">
        <Checkbox size="small" color="primary" checked={isSelected} onClick={event => handleSelectRow(event, product.id)} />
      </TableCell>

      <TableCell padding="normal">
        <FlexBox alignItems="center" gap={2}>
          <Avatar variant="rounded" alt={product.cropProduced} src="/static/avatar/001-man.svg" sx={{
          width: 50,
          height: 50
        }} />

          <Box>
            <Paragraph fontWeight={500} color="text.primary" sx={{
            ":hover": {
              textDecoration: "underline",
              cursor: "pointer"
            }
          }}>
              {product.cropProduced}
            </Paragraph>
            <Paragraph fontSize={13}>{product?.farmerName}</Paragraph>
          </Box>
        </FlexBox>
      </TableCell>
      <TableCell padding="normal">
        {product.farmerName}
      </TableCell>

      <TableCell padding="normal">{product?.dateSubmitted}</TableCell>

      <TableCell padding="normal" >
        {product.quantityAvailable}
      </TableCell>

      <TableCell padding="normal">{loading ? "User Loading..." : bdspUser ? bdspUser.displayName ||bdspUser.name : null }</TableCell>

      

      <TableCell padding="normal" align="right">
        <TableMoreMenu open={openMenuEl} handleOpen={handleOpenMenu} handleClose={handleCloseOpenMenu}>
          <TableMoreMenuItem Icon={RemoveRedEye} title="View" handleClick={() => {
          handleCloseOpenMenu();
          navigate("/dashboard/products/product-details");
        }} />
          <TableMoreMenuItem Icon={Edit} title="Edit" handleClick={() => {
          handleCloseOpenMenu();
          navigate("/dashboard/products/create-product");
        }} />
          <TableMoreMenuItem Icon={DeleteOutline} title="Delete" handleClick={() => {
          handleCloseOpenMenu();
          handleDeleteProduct(product?.id);
        }} />
        </TableMoreMenu>
      </TableCell>
    </TableRow>;
};

export default ProductTableRow;