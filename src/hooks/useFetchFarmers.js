import { useContext, useEffect, useState } from 'react';
import { query, collection, getDocs } from 'firebase/firestore';
import { AuthContext } from 'contexts/firebaseContext';

const useFetchFarmers = () => {
  const [registeredFarmers, setRegisteredFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { db } = useContext(AuthContext);
  const [cropAvailabilityData, setCropAvailabilityData] = useState([]);
  const [inputRequestData, setInputRequestData] = useState([]);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        setLoading(true);
        console.log('Starting to fetch users...');
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched users:', usersList);

        const farmersData = [];
        const cropAvailabilityArray = [];
        const inputRequests = [];

        for (const user of usersList) {
          console.log(`Fetching farmers for user ${user.id}...`);
          const farmersQuery = query(collection(db, `users/${user.id}/farmers`));
          const farmersSnapshot = await getDocs(farmersQuery);
          const farmersList = farmersSnapshot.docs.map(doc => ({ id: doc.id, userId: user.id, ...doc.data() }));
          console.log(`Fetched farmers for user ${user.id}:`, farmersList);
          let cropAvailabilityTotal = 0;
        let inputRequestsTotal = 0;

          for (const farmer of farmersList) {
            console.log(`Fetching crop availability for farmer ${farmer.id} of user ${user.id}...`);
            const cropAvailabilityQuery = query(collection(db, `users/${user.id}/farmers/${farmer.id}/CropAvailability`));
            const cropAvailabilitySnapshot = await getDocs(cropAvailabilityQuery);
            const cropAvailabilityInfo = cropAvailabilitySnapshot.docs.map(doc => ({ id: doc.id, farmerId: farmer.id, userId: user.id, ...doc.data() }));
            console.log(`Fetched crop availability for farmer ${farmer.id}:`, cropAvailabilityInfo);
            const inputRequestQuery = query(collection(db, `users/${user.id}/farmers/${farmer.id}/InputRequests`));
            const inputRequestSnapshot = await getDocs(inputRequestQuery);
            const inputRequestInfo = inputRequestSnapshot.docs.map(doc => ({ id: doc.id, farmerId: farmer.id, userId: user.id, ...doc.data() }));
            console.log(`Fetched crop availability for farmer ${farmer.id}:`, inputRequestInfo);



            // Append each crop availability item into the cropAvailabilityArray
            cropAvailabilityArray.push(...cropAvailabilityInfo);

            // Append each InputRequestInfo item into the InputRequest array
            inputRequests.push(...inputRequestInfo);

            farmersData.push({
              ...farmer,
              cropAvailabilityInfo
            });
          }
        }

        setRegisteredFarmers(farmersData);
        setCropAvailabilityData(cropAvailabilityArray); // Set the complete array of crop availability data
        setInputRequestData(inputRequests); // Set the complete array of crop availability data
        setLoading(false);
        console.log('Completed fetching all data');
      } catch (error) {
        console.error('Error fetching farmers and crop availability:', error);
        setError(error);
        setLoading(false);
      }
    };

    fetchFarmers();
  }, []);

  const findFarmerById = (id) => {
    return registeredFarmers.find(farmer => farmer.id === id);
  };

  const aggregateCropAvailabilityData = async () => {
    try {
      const cropDataPerUser = {};
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const cropDataCollection = collection(db, `users/${userId}/cropAvailabilityData`);
        const cropDataSnapshot = await getDocs(cropDataCollection);
        cropDataPerUser[userId] = cropDataSnapshot.size;
      }

      return cropDataPerUser;
    } catch (err) {
      console.error('Error aggregating crop availability data:', err);
      return null;
    }
  };

  const getInputRequestsData = async () => {
    try {
      const inputRequestsPerUser = {};
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const farmersCollection = collection(db, `users/${userId}/farmers`);
        const farmersSnapshot = await getDocs(farmersCollection);

        const userInputRequests = [];
        for (const farmerDoc of farmersSnapshot.docs) {
          const farmerId = farmerDoc.id;
          const inputRequestsCollection = collection(db, `users/${userId}/farmers/${farmerId}/InputRequests`);
          const inputRequestsSnapshot = await getDocs(inputRequestsCollection);
          
          inputRequestsSnapshot.forEach(doc => {
            userInputRequests.push({ id: doc.id, ...doc.data() });
          });
        }

        inputRequestsPerUser[userId] = userInputRequests;
      }

      return inputRequestsPerUser;
    } catch (err) {
      console.error('Error fetching input requests:', err);
      return null;
    }
  };

  const aggregateUserSubmissions = async () => {
    try {
      const usersData = [];
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const farmersCollection = collection(db, `users/${userId}/farmers`);
        const farmersSnapshot = await getDocs(farmersCollection);

        let cropAvailabilityTotal = 0;
        let inputRequestsTotal = 0;

        for (const farmerDoc of farmersSnapshot.docs) {
          const farmerId = farmerDoc.id;
          const cropAvailabilityCollection = collection(db, `users/${userId}/farmers/${farmerId}/cropAvailabilityData`);
          const cropAvailabilitySnapshot = await getDocs(cropAvailabilityCollection);
          cropAvailabilityTotal += cropAvailabilitySnapshot.size;

          const inputRequestsCollection = collection(db, `users/${userId}/farmers/${farmerId}/InputRequests`);
          const inputRequestsSnapshot = await getDocs(inputRequestsCollection);
          inputRequestsTotal += inputRequestsSnapshot.size;
        }

        usersData.push({
          id: userId,
          ...userDoc.data(),
          cropAvailabilityNum: cropAvailabilityTotal,
          inputRequestsNum: inputRequestsTotal,
        });
      }

      return usersData;
    } catch (err) {
      console.error('Error aggregating crop availability data:', err);
      return null;
    }
  };

  return { registeredFarmers, loading, findFarmerById, error, cropAvailabilityData, inputRequestData, getInputRequestsData, aggregateCropAvailabilityData, aggregateUserSubmissions  };
};

export default useFetchFarmers;
