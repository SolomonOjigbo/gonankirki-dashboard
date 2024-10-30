"use client";

import { useState } from "react";
import { Box, Card, CircularProgress, Table, TableBody, TableContainer, TablePagination } from "@mui/material"; // CUSTOM COMPONENTS

import { Scrollbar } from "components/scrollbar";
import { TableDataNotFound, TableToolbar } from "components/table"; // CUSTOM PAGE SECTION COMPONENTS

import SearchArea from "../SearchArea";
import HeadingArea from "../HeadingArea";
import UserTableRow from "../UserTableRow";
import UserTableHead from "../UserTableHead"; // CUSTOM DEFINED HOOK

import useMuiTable, { getComparator, stableSort } from "hooks/useMuiTable"; // CUSTOM DUMMY DATA

import useFetchFarmers from '../../../hooks/useFetchFarmers';
import AddContactForm from "../AddContactForm";
// import { USER_LIST } from "__fakeData__/users";


const InputRequestsPageView = () => {
  // const [users, setUsers] = useState([...USER_LIST]);
  const { inputRequestData, loading, error} = useFetchFarmers();
  const [requests, setRequests] = useState(inputRequestData);
  const [farmersFilter, setFarmersFilter] = useState({
    farmerLocation: "",
    search: ""
  });
  const {
    page,
    order,
    orderBy,
    selected,
    isSelected,
    rowsPerPage,
    handleSelectRow,
    handleChangePage,
    handleRequestSort,
    handleSelectAllRows,
    handleChangeRowsPerPage
  } = useMuiTable({
    defaultOrderBy: "farmerName"
  });

  const handleChangeFilter = (key, value) => {
    setFarmersFilter(state => ({ ...state,
      [key]: value
    }));
  };

  const handleChangeTab = (_, newValue) => {
    handleChangeFilter("farmerLocation", newValue);
  };

  let filteredFarmers = stableSort(inputRequestData, getComparator(order, orderBy)).filter(item => {
    if (farmersFilter.farmerLocation) return item.farmerLocation.toLowerCase() === farmersFilter.farmerLocation;else if (farmersFilter.search) return item.name.toLowerCase().includes(farmersFilter.search.toLowerCase());else return true;
  });

  const handleDeleteFarmer = id => {
    setRequests(state => state.filter(item => item.id !== id));
  };

  const handleAllFarmerDelete = () => {
    setRequests(state => state.filter(item => !selected.includes(item.id)));
    handleSelectAllRows([])();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return <Box pt={2} pb={4}>
      <Card>
        <Box px={2} pt={2}>
          <HeadingArea value={farmersFilter.farmerLocation} changeTab={handleChangeTab} />

          <SearchArea value={farmersFilter.search} gridRoute="/dashboard/users/user-grid-1" listRoute="/dashboard/users/user-list-1" onChange={e => handleChangeFilter("search", e.target.value)} />
        </Box>

        {
        /* TABLE ROW SELECTION HEADER  */
      }
        {selected.length > 0 && <TableToolbar selected={selected.length} handleDeleteRows={handleAllFarmerDelete} />}


       

        {
        /* TABLE HEAD & BODY ROWS */
      }
        <TableContainer>
          <Scrollbar autoHide={false}>
            <Table>
              <UserTableHead order={order} orderBy={orderBy} numSelected={selected.length} rowCount={filteredFarmers.length} onRequestSort={handleRequestSort} onSelectAllRows={handleSelectAllRows(filteredFarmers.map(row => row.id))} />

              <TableBody>
                {filteredFarmers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(request => <UserTableRow key={request.id} request={request} isSelected={isSelected(request.id)} handleSelectRow={handleSelectRow} handleDeleteFarmer={handleDeleteFarmer} />)}

                {filteredFarmers.length === 0 &&   <TableDataNotFound />}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        {
        /* PAGINATION SECTION */
      }
        <Box padding={1}>
          <TablePagination page={page} component="div" rowsPerPage={rowsPerPage} count={filteredFarmers.length} onPageChange={handleChangePage} rowsPerPageOptions={[5, 10, 25]} onRowsPerPageChange={handleChangeRowsPerPage} />
        </Box>
      </Card>
    </Box>;
};

export default InputRequestsPageView;