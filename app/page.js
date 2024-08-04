'use client' // To make it a client-sided app
import { useState, useEffect } from "react";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { firestore } from '@/firebase';
import { Box, Modal, Typography, Stack, TextField, Button, AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemText, Divider, CssBaseline, Container, Grid, Paper, MenuItem, Select, InputLabel, FormControl, Link, Popover } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { collection, deleteDoc, doc, getDocs, getDoc, setDoc, query } from 'firebase/firestore';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50', // Green
    },
    secondary: {
      main: '#FF5722', // Orange
    },
  },
  typography: {
    fontFamily: 'Montserrat, sans-serif',
  },
});

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('');
  const [itemQuantity, setItemQuantity] = useState(0);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categoriesAnchorEl, setCategoriesAnchorEl] = useState(null);
  const [isClient, setIsClient] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    setIsClient(true);
    updateInventory();
  }, []);

  useEffect(() => {
    setFilteredInventory(
      inventory.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterCategory === '' || item.category === filterCategory)
      )
    );
  }, [searchTerm, filterCategory, inventory]);

  // Function to update the inventory from the Firestore DB
  const updateInventory = async () => { 
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
    setFilteredInventory(inventoryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity, category } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1, category });
    } else {
      await setDoc(docRef, { quantity: 1, category: itemCategory });
    }
  
    await updateInventory();
  };

  const decrementItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity, category } = docSnap.data();
      if (quantity > 1) {
        await setDoc(docRef, { quantity: quantity - 1, category });
      } else {
        await deleteDoc(docRef);
      }
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    await deleteDoc(docRef);
    await updateInventory();
  };

  const updateItem = async () => {
    if (currentItem) {
      const docRef = doc(collection(firestore, 'inventory'), currentItem);
      await setDoc(docRef, { name: itemName, category: itemCategory, quantity: itemQuantity });
      await updateInventory();
      handleUpdateClose();
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleUpdateOpen = (item) => {
    setCurrentItem(item.name);
    setItemName(item.name);
    setItemCategory(item.category);
    setItemQuantity(item.quantity);
    setUpdateOpen(true);
  };
  const handleUpdateClose = () => setUpdateOpen(false);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      addItem(itemName);
      setItemName('');
      setItemCategory('');
      handleClose();
    }
  };

  const handleCategoriesClick = (event) => {
    setCategoriesAnchorEl(event.currentTarget);
  };

  const handleCategoriesClose = () => {
    setCategoriesAnchorEl(null);
  };

  const categoriesOpen = Boolean(categoriesAnchorEl);
  const categoriesId = categoriesOpen ? 'simple-popover' : undefined;

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', bgcolor: '#f0f4f8', minHeight: '100vh' }}>
        <CssBaseline />
        <AppBar position="fixed">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
              Inventory Tracker
            </Typography>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Link href="#" color="inherit" underline="none" sx={{ mx: 1 }}>
                Home
              </Link>
              <Link href="#" color="inherit" underline="none" sx={{ mx: 1 }} onClick={handleOpen}>
                Add Item
              </Link>
              <Link href="#" color="inherit" underline="none" sx={{ mx: 1 }} onClick={handleCategoriesClick}>
                Categories
              </Link>
            </Box>
          </Toolbar>
        </AppBar>
        {isClient && (
          <Drawer
            variant="temporary"
            open={drawerOpen}
            onClose={toggleDrawer}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
            }}
          >
            <Toolbar />
            <Box sx={{ overflow: 'auto' }}>
              <List>
                <ListItem button>
                  <ListItemText primary="Home" />
                </ListItem>
                <ListItem button onClick={handleOpen}>
                  <ListItemText primary="Add New Item" />
                </ListItem>
                <ListItem button onClick={handleCategoriesClick}>
                  <ListItemText primary="Categories" />
                </ListItem>
              </List>
              <Divider />
            </Box>
          </Drawer>
        )}
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3 }}
        >
          <Toolbar />
          <Container maxWidth="lg">
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  variant="outlined"
                  fullWidth
                  label="Search Item"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Filter by Category</InputLabel>
                  <Select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    label="Filter by Category"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value="Bakery">Bakery</MenuItem>
                    <MenuItem value="Frozen Foods">Frozen Foods</MenuItem>
                    <MenuItem value="Beverages">Beverages</MenuItem>
                    <MenuItem value="Cereal">Cereal</MenuItem>
                    <MenuItem value="Condiment">Condiment</MenuItem>
                    <MenuItem value="Dairy Product">Dairy Product</MenuItem>
                    <MenuItem value="Produce">Produce</MenuItem>
                    <MenuItem value="Seafood">Seafood</MenuItem>
                    <MenuItem value="Meat">Meat</MenuItem>
                    <MenuItem value="Snacks">Snacks</MenuItem>
                    <MenuItem value="Canned Food">Canned Food</MenuItem>
                    <MenuItem value="Dairy and Eggs">Dairy and Eggs</MenuItem>
                    <MenuItem value="Herbs and Spices">Herbs and Spices</MenuItem>
                    <MenuItem value="Prepared Food">Prepared Food</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h4" gutterBottom>
                Inventory List
              </Typography>
              <Stack spacing={2}>
                {filteredInventory.map(({ name, quantity, category }) => (
                  <Paper
                    key={name}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 2,
                      bgcolor: '#f5f5f5', // light grey background
                      flexDirection: isSmallScreen ? 'column' : 'row',
                    }}
                  >
                    <Box sx={{ flexGrow: 1, textAlign: isSmallScreen ? 'center' : 'left' }}>
                      <Typography variant="h6">{name.charAt(0).toUpperCase() + name.slice(1)}</Typography>
                      {category && (
                        <Typography variant="body1">Category: {category}</Typography>
                      )}
                    </Box>
                    <Typography variant="h6" sx={{ textAlign: 'center', mx: isSmallScreen ? 0 : 2 }}>Quantity: {quantity}</Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: isSmallScreen ? 'column' : 'row',
                        gap: isSmallScreen ? 1 : 2,
                        mt: isSmallScreen ? 1 : 0,
                      }}
                    >
                      <Button 
                        variant="contained" 
                        color="secondary" 
                        onClick={() => addItem(name)}
                      >
                        +
                      </Button>
                      <Button 
                        variant="contained" 
                        color="secondary" 
                        onClick={() => decrementItem(name)}
                      >
                        -
                      </Button>
                      <Button 
                        variant="contained" 
                        color="secondary" 
                        onClick={() => removeItem(name)}
                      >
                        Remove
                      </Button>
                      <Button 
                        variant="contained" 
                        color="secondary" 
                        onClick={() => handleUpdateOpen({ name, quantity, category })}
                      >
                        Update
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </Container>
        </Box>
        <Modal open={open} onClose={handleClose}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={400}
            bgcolor="white"
            border="2px solid black"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{
              transform: 'translate(-50%, -50%)',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6"> Add Item </Typography>
            <Stack spacing={2}>
              <TextField
                variant="outlined"
                fullWidth
                label="Item Name"
                value={itemName}
                onChange={(e) => {
                  setItemName(e.target.value);
                }}
                onKeyPress={handleKeyPress}
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="Bakery">Bakery</MenuItem>
                  <MenuItem value="Frozen Foods">Frozen Foods</MenuItem>
                  <MenuItem value="Beverages">Beverages</MenuItem>
                  <MenuItem value="Cereal">Cereal</MenuItem>
                  <MenuItem value="Condiment">Condiment</MenuItem>
                  <MenuItem value="Dairy Product">Dairy Product</MenuItem>
                  <MenuItem value="Produce">Produce</MenuItem>
                  <MenuItem value="Seafood">Seafood</MenuItem>
                  <MenuItem value="Meat">Meat</MenuItem>
                  <MenuItem value="Snacks">Snacks</MenuItem>
                  <MenuItem value="Canned Food">Canned Food</MenuItem>
                  <MenuItem value="Dairy and Eggs">Dairy and Eggs</MenuItem>
                  <MenuItem value="Herbs and Spices">Herbs and Spices</MenuItem>
                  <MenuItem value="Prepared Food">Prepared Food</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                onClick={() => {
                  addItem(itemName);
                  setItemName('');
                  setItemCategory('');
                  handleClose();
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Modal open={updateOpen} onClose={handleUpdateClose}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={400}
            bgcolor="white"
            border="2px solid black"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{
              transform: 'translate(-50%, -50%)',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6"> Update Item </Typography>
            <Stack spacing={2}>
              <TextField
                variant="outlined"
                fullWidth
                label="Item Name"
                value={itemName}
                onChange={(e) => {
                  setItemName(e.target.value);
                }}
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="Bakery">Bakery</MenuItem>
                  <MenuItem value="Frozen Foods">Frozen Foods</MenuItem>
                  <MenuItem value="Beverages">Beverages</MenuItem>
                  <MenuItem value="Cereal">Cereal</MenuItem>
                  <MenuItem value="Condiment">Condiment</MenuItem>
                  <MenuItem value="Dairy Product">Dairy Product</MenuItem>
                  <MenuItem value="Produce">Produce</MenuItem>
                  <MenuItem value="Seafood">Seafood</MenuItem>
                  <MenuItem value="Meat">Meat</MenuItem>
                  <MenuItem value="Snacks">Snacks</MenuItem>
                  <MenuItem value="Canned Food">Canned Food</MenuItem>
                  <MenuItem value="Dairy and Eggs">Dairy and Eggs</MenuItem>
                  <MenuItem value="Herbs and Spices">Herbs and Spices</MenuItem>
                  <MenuItem value="Prepared Food">Prepared Food</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField
                variant="outlined"
                fullWidth
                label="Quantity"
                type="number"
                value={itemQuantity}
                onChange={(e) => {
                  setItemQuantity(Number(e.target.value));
                }}
              />
              <Button
                variant="outlined"
                onClick={updateItem}
              >
                Update
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Popover
          id={categoriesId}
          open={categoriesOpen}
          anchorEl={categoriesAnchorEl}
          onClose={handleCategoriesClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Categories</Typography>
            <List>
              <ListItem>
                <ListItemText primary="Bakery" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Frozen Foods" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Beverages" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Cereal" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Condiment" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Dairy Product" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Produce" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Seafood" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Meat" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Snacks" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Canned Food" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Dairy and Eggs" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Herbs and Spices" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Prepared Food" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Other" />
              </ListItem>
            </List>
          </Box>
        </Popover>
      </Box>
    </ThemeProvider>
  );
}
