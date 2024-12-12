import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { API_URL } from '@env';

const ProgressBar = ({ currentStep, totalSteps }) => (
  <View style={styles.progressContainer}>
    <View style={styles.progressBar}>
      <View 
        style={[
          styles.progressFill, 
          { width: `${(currentStep / totalSteps) * 100}%` }
        ]} 
      />
    </View>
    <Text style={styles.progressText}>Step {currentStep} of {totalSteps}</Text>
  </View>
);

const FormInput = ({ label, error, ...props }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[
        styles.input,
        error && styles.inputError,
        props.multiline && styles.multilineInput
      ]}
      placeholderTextColor="#666"
      {...props}
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);


const CustomPicker = ({ label, items, error, showImages = false, ...props }) => (
  <View style={styles.pickerContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={[styles.pickerWrapper, error && styles.inputError]}>
      {showImages ? (
        <View style={styles.productListContainer}>
          <View style={styles.productListHeader}>
            <Text style={styles.productListHeaderText}>
              {props.selectedValue 
                ? `Selected: ${items.find(item => item.value === props.selectedValue)?.label}`
                : 'Select a product'}
            </Text>
          </View>
          
          <ScrollView 
            style={styles.productList}
            contentContainerStyle={styles.productListContent}
            showsVerticalScrollIndicator={true}
            persistentScrollbar={true}
            nestedScrollEnabled={true} // Added this prop
          >
            {items.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.productItem,
                  item.value === props.selectedValue && styles.selectedProduct
                ]}
                onPress={() => props.onValueChange(item.value)}
              >
                {item.images && item.images.length > 0 ? (
                  <Image
                    source={{ uri: item.images[0] }}
                    style={styles.productItemImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholderImage} />
                )}
                <View style={styles.productItemContent}>
                  <Text 
                    style={[
                      styles.productItemText,
                      item.value === props.selectedValue && styles.selectedProductText
                    ]}
                    numberOfLines={2}
                  >
                    {item.label}
                  </Text>
                </View>
                {item.value === props.selectedValue && (
                  <MaterialIcons name="check-circle" size={24} color="#007AFF" style={styles.selectedIcon} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.productListFooter}>
            <Text style={styles.productCountText}>
              {items.length - 1} products available
            </Text>
          </View>
        </View>
      ) : (
        <Picker
          style={styles.picker}
          itemStyle={styles.pickerItem}
          {...props}
        >
          {items.map((item) => (
            <Picker.Item 
              key={item.value} 
              label={item.label}
              value={item.value}
            />
          ))}
        </Picker>
      )}
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);
const DesignerOrderScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { designerId, user } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // State for brands and products
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [brandProducts, setBrandProducts] = useState([]);

  const [formData, setFormData] = useState({
    designerId: designerId,
    userId: user?._id,
    brandId: '',
    productId: '',
    fullName: '',
    phone: '',
    email: '',
    address: '',
    garmentType: '',
    occasion: '',
    pattern: '',
    fitting: '',
    neckline: '',
    sleeves: '',
    measurements: {
      chest: '',
      shoulder: '',
      waist: '',
      inseam: '',
      armLength: '',
      legLength: '',
    },
    specialInstructions: '',
    deliveryPreference: '',
    paymentMethod: '',
    rushOrder: false,
    consultationDate: new Date(),
  });

  // Fetch brands on component mount
  useEffect(() => {
    fetchBrands();
  }, []);

  // Fetch brand products when a brand is selected
  useEffect(() => {
    if (selectedBrand) {
      fetchBrandProducts(selectedBrand);
    }
  }, [selectedBrand]);

  const fetchBrands = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) throw new Error('Failed to fetch brands');
      const data = await response.json();
      const brandUsers = data.filter(user => user.userType === 'brand');
      setBrands(brandUsers);
    } catch (error) {
      console.error('Error fetching brands:', error);
      Alert.alert('Error', 'Failed to load brands');
    } finally {
      setDataLoading(false);
    }
  };

  const fetchBrandProducts = async (brandId) => {
    try {
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      const filteredProducts = data.filter(product => product.brandId === brandId);
      setBrandProducts(filteredProducts);
    } catch (error) {
      console.error('Error fetching brand products:', error);
      Alert.alert('Error', 'Failed to load brand products');
    }
  };

  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const validateStep = () => {
    const newErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.fullName) newErrors.fullName = 'Name is required';
        if (!formData.phone) newErrors.phone = 'Phone is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.address) newErrors.address = 'Address is required';
        break;
      case 2:
        if (!formData.brandId) newErrors.brandId = 'Please select a brand';
        if (!formData.productId) newErrors.productId = 'Please select a product';
        if (!formData.garmentType) newErrors.garmentType = 'Please select a garment type';
        if (!formData.occasion) newErrors.occasion = 'Please select an occasion';
        break;
      case 3:
        if (!formData.pattern) newErrors.pattern = 'Pattern is required';
        if (!formData.fitting) newErrors.fitting = 'Fitting preference is required';
        break;
      case 4:
        if (!formData.measurements.chest) newErrors['measurements.chest'] = 'Chest measurement is required';
        if (!formData.measurements.shoulder) newErrors['measurements.shoulder'] = 'Shoulder measurement is required';
        if (!formData.measurements.waist) newErrors['measurements.waist'] = 'Waist measurement is required';
        break;
      case 5:
        if (!formData.deliveryPreference) newErrors.deliveryPreference = 'Delivery preference is required';
        if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => setStep(prev => prev - 1);


  const submitOrder = async (orderData) => {
    try {
      // First, fetch product details to get price
      const productResponse = await fetch(`${API_URL}/products`);
      if (!productResponse.ok) {
        throw new Error('Failed to fetch product details');
      }
      
      const products = await productResponse.json();
      const product = products.find(p => p._id === orderData.productId);
      
      if (!product) {
        throw new Error('Product not found');
      }
  
      // Fetch designer details to get their address
      const designerResponse = await fetch(`${API_URL}/users`);
      if (!designerResponse.ok) {
        throw new Error('Failed to fetch designer details');
      }
  
      const users = await designerResponse.json();
      const designer = users.find(user => user._id === orderData.designerId);
  
      if (!designer) {
        throw new Error('Designer not found');
      }
  
      const orderPrice = product.price;
  
      // Submit to custom-orders endpoint
      const customOrderResponse = await fetch(`${API_URL}/custom-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          price: orderPrice
        })
      });
  
      if (!customOrderResponse.ok) {
        const errorData = await customOrderResponse.json();
        throw new Error(errorData.error || 'Failed to submit custom order');
      }
  
      const customOrderResult = await customOrderResponse.json();
  
      // Submit to orders endpoint with designer's address
      const generalOrderData = {
        userId: orderData.designerId,
        orderId: customOrderResult._id,
        totalPrice: orderPrice,
        orderDate: new Date().toISOString(),
        status: 'Pending',
        paymentMethod: orderData.paymentMethod,
        shippingAddress: designer.address, // Directly use the entire address object
        items: [{
          productId: orderData.productId,
          brandId: orderData.brandId,
          quantity: 1,
          price: orderPrice
        }]
      };
  
      const orderResponse = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generalOrderData)
      });
  
      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to submit general order');
      }
  
      const orderResult = await orderResponse.json();
      
      return {
        customOrder: customOrderResult,
        generalOrder: orderResult
      };
  
    } catch (error) {
      console.error('Order submission error:', error);
      throw error;
    }
  };

  

  const handleSubmit = async () => {
    if (!validateStep()) return;

    Alert.alert(
      'Confirm Order',
      'Please review your order details carefully before confirming.',
      [
        {
          text: 'Review Again',
          style: 'cancel',
        },
        {
          text: 'Confirm Order',
          style: 'default',
          onPress: async () => {
            setLoading(true);
            try {
              const orderData = {
                ...formData,
                brandId: formData.brandId,
                productId: formData.productId,
                status: 'pending',
                orderDate: new Date().toISOString(),
                consultationDate: formData.consultationDate.toISOString(),
                measurements: {
                  ...formData.measurements,
                  chest: parseFloat(formData.measurements.chest),
                  shoulder: parseFloat(formData.measurements.shoulder),
                  waist: parseFloat(formData.measurements.waist),
                  inseam: parseFloat(formData.measurements.inseam),
                  armLength: parseFloat(formData.measurements.armLength),
                  legLength: parseFloat(formData.measurements.legLength),
                }
              };

              const result = await submitOrder(orderData);
            
              Alert.alert(
                'Order Placed Successfully',
                'Your order has been received. Thank you.',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('Designer Order History',{ user: user }),
                  }
                ]
              );
            } catch (error) {
              Alert.alert(
                'Error',
                error.message || 'There was an error placing your order. Please try again.'
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderSummaryItem = (label, value) => (
    <View style={styles.summaryRow} key={label}>
      <Text style={styles.summaryLabel}>{label}:</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text style={styles.stepTitle}>Personal Information</Text>
            <FormInput
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChangeText={(text) => updateFormData('fullName', text)}
              error={errors.fullName}
            />
            <FormInput
              label="Phone Number"
              placeholder="+92 300 1234567"
              value={formData.phone}
              onChangeText={(text) => updateFormData('phone', text)}
              keyboardType="phone-pad"
              error={errors.phone}
            />
            <FormInput
              label="Email Address"
              placeholder="your.email@example.com"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            <FormInput
              label="Delivery Address"
              placeholder="Enter your complete delivery address"
              value={formData.address}
              onChangeText={(text) => updateFormData('address', text)}
              multiline
              numberOfLines={3}
              error={errors.address}
            />
          </View>
        );

      case 2:
        return (
          <View>
            <Text style={styles.stepTitle}>Brand and Product Selection</Text>
            
            {dataLoading ? (
              <ActivityIndicator size="large" color="#007AFF" />
            ) : (
              <>
                <CustomPicker
                  label="Select Brand"
                  selectedValue={formData.brandId}
                  onValueChange={(value) => {
                    updateFormData('brandId', value);
                    setSelectedBrand(value);
                    updateFormData('productId', '');
                  }}
                  items={[
                    { label: "Select a Brand", value: "" },
                    ...brands.map(brand => ({
                      label: brand.name,
                      value: brand._id
                    }))
                  ]}
                  error={errors.brandId}
                />

              {selectedBrand && (
                <CustomPicker
                  label="Select Product"
                  selectedValue={formData.productId}
                  onValueChange={(value) => updateFormData('productId', value)}
                  items={[
                    { label: "Select a Product", value: "" },
                    ...brandProducts.map(product => ({
                      label: product.name,
                      value: product._id,
                      images: product.images
                    }))
                  ]}
                  error={errors.productId}
                  showImages={true}
                />
              )}

                <CustomPicker
                  label="Garment Type"
                  selectedValue={formData.garmentType}
                  onValueChange={(value) => updateFormData('garmentType', value)}
                  items={[
                    { label: "Select Garment Type", value: "" },
                    { label: "Shalwar Kameez", value: "shalwarKameez" },
                    { label: "Kurta Pajama", value: "kurtaPajama" },
                    { label: "Sherwani", value: "sherwani" },
                    { label: "Waistcoat", value: "waistcoat" },
                  ]}
                  error={errors.garmentType}
                />

                <CustomPicker
                  label="Occasion"
                  selectedValue={formData.occasion}
                  onValueChange={(value) => updateFormData('occasion', value)}
                  items={[
                    { label: "Select Occasion", value: "" },
                    { label: "Casual Wear", value: "casual" },
                    { label: "Eid", value: "eid" },
                    { label: "Wedding", value: "wedding" },
                    { label: "Formal Event", value: "formal" },
                  ]}
                  error={errors.occasion}
                />
              </>
            )}
          </View>
        );

      case 3:
        return (
          <View>
            <Text style={styles.stepTitle}>Design Preferences</Text>
            <CustomPicker
              label="Pattern"
              selectedValue={formData.pattern}
              onValueChange={(value) => updateFormData('pattern', value)}
              items={[
                { label: "Select Pattern", value: "" },
                { label: "Solid", value: "solid" },
                { label: "Floral", value: "floral" },
                { label: "Geometric", value: "geometric" },
                { label: "Striped", value: "striped" },
              ]}
              error={errors.pattern}
            />
            <CustomPicker
             label="Fitting"
             selectedValue={formData.fitting}
             onValueChange={(value) => updateFormData('fitting', value)}
             items={[
               { label: "Select Fitting", value: "" },
               { label: "Regular", value: "regular" },
               { label: "Slim", value: "slim" },
               { label: "Loose", value: "loose" },
             ]}
             error={errors.fitting}
           />
           <CustomPicker
             label="Neckline Style"
             selectedValue={formData.neckline}
             onValueChange={(value) => updateFormData('neckline', value)}
             items={[
               { label: "Select Neckline", value: "" },
               { label: "Round", value: "round" },
               { label: "V-Neck", value: "vneck" },
               { label: "Collar", value: "collar" },
               { label: "Mandarin", value: "mandarin" },
             ]}
           />
           <CustomPicker
             label="Sleeve Style"
             selectedValue={formData.sleeves}
             onValueChange={(value) => updateFormData('sleeves', value)}
             items={[
               { label: "Select Sleeves", value: "" },
               { label: "Full", value: "full" },
               { label: "Three Quarter", value: "threeQuarter" },
               { label: "Half", value: "half" },
               { label: "Sleeveless", value: "sleeveless" },
             ]}
           />
         </View>
       );

     case 4:
       return (
         <View>
           <Text style={styles.stepTitle}>Measurements</Text>
           <Text style={styles.measurementNote}>Please provide measurements in inches</Text>
           <FormInput
             label="Chest"
             placeholder="Enter chest measurement"
             value={formData.measurements.chest}
             onChangeText={(text) => setFormData(prev => ({
               ...prev,
               measurements: {
                 ...prev.measurements,
                 chest: text
               }
             }))}
             keyboardType="numeric"
             error={errors['measurements.chest']}
           />
           <FormInput
             label="Shoulder"
             placeholder="Enter shoulder measurement"
             value={formData.measurements.shoulder}
             onChangeText={(text) => setFormData(prev => ({
               ...prev,
               measurements: {
                 ...prev.measurements,
                 shoulder: text
               }
             }))}
             keyboardType="numeric"
             error={errors['measurements.shoulder']}
           />
           <FormInput
             label="Waist"
             placeholder="Enter waist measurement"
             value={formData.measurements.waist}
             onChangeText={(text) => setFormData(prev => ({
               ...prev,
               measurements: {
                 ...prev.measurements,
                 waist: text
               }
             }))}
             keyboardType="numeric"
             error={errors['measurements.waist']}
           />
           <FormInput
             label="Inseam"
             placeholder="Enter inseam measurement"
             value={formData.measurements.inseam}
             onChangeText={(text) => setFormData(prev => ({
               ...prev,
               measurements: {
                 ...prev.measurements,
                 inseam: text
               }
             }))}
             keyboardType="numeric"
             error={errors['measurements.inseam']}
           />
           <FormInput
             label="Arm Length"
             placeholder="Enter arm length measurement"
             value={formData.measurements.armLength}
             onChangeText={(text) => setFormData(prev => ({
               ...prev,
               measurements: {
                 ...prev.measurements,
                 armLength: text
               }
             }))}
             keyboardType="numeric"
             error={errors['measurements.armLength']}
           />
           <FormInput
             label="Leg Length"
             placeholder="Enter leg length measurement"
             value={formData.measurements.legLength}
             onChangeText={(text) => setFormData(prev => ({
               ...prev,
               measurements: {
                 ...prev.measurements,
                 legLength: text
               }
             }))}
             keyboardType="numeric"
             error={errors['measurements.legLength']}
           />
         </View>
       );

     case 5:
       return (
         <View>
           <Text style={styles.stepTitle}>Additional Details</Text>
           <FormInput
             label="Special Instructions"
             placeholder="Enter any special instructions or requirements"
             value={formData.specialInstructions}
             onChangeText={(text) => updateFormData('specialInstructions', text)}
             multiline
             numberOfLines={4}
             style={styles.specialInstructionsInput}
           />
           <CustomPicker
             label="Delivery Preference"
             selectedValue={formData.deliveryPreference}
             onValueChange={(value) => updateFormData('deliveryPreference', value)}
             items={[
               { label: "Select Delivery Preference", value: "" },
               { label: "Home Delivery", value: "homeDelivery" },
               { label: "Pickup from Store", value: "pickup" },
             ]}
             error={errors.deliveryPreference}
           />
           <CustomPicker
             label="Payment Method"
             selectedValue={formData.paymentMethod}
             onValueChange={(value) => updateFormData('paymentMethod', value)}
             items={[
               { label: "Select Payment Method", value: "" },
               { label: "Cash on Delivery", value: "cod" },
               { label: "Credit/Debit Card", value: "card" },
               { label: "JazzCash/Easypaisa", value: "mobileMoney" },
             ]}
             error={errors.paymentMethod}
           />
           <View style={styles.dateContainer}>
             <Text style={styles.inputLabel}>Consultation Date</Text>
             <TouchableOpacity 
               style={styles.datePickerButton}
               onPress={() => setShowDatePicker(true)}
             >
               <Text style={styles.datePickerText}>
                 {formData.consultationDate.toLocaleDateString()}
               </Text>
             </TouchableOpacity>
           </View>
           {showDatePicker && (
             <DateTimePicker
               value={formData.consultationDate}
               mode="date"
               display="default"
               minimumDate={new Date()}
               onChange={(event, selectedDate) => {
                 setShowDatePicker(false);
                 if (selectedDate) {
                   updateFormData('consultationDate', selectedDate);
                 }
               }}
             />
           )}
         </View>
       );

     case 6:
       return (
         <View>
           <Text style={styles.stepTitle}>Order Summary</Text>
           <ScrollView style={styles.summaryContainer}>
             <View style={styles.summarySection}>
               <Text style={styles.summarySubtitle}>Personal Information</Text>
               {renderSummaryItem('Full Name', formData.fullName)}
               {renderSummaryItem('Phone', formData.phone)}
               {renderSummaryItem('Email', formData.email)}
               {renderSummaryItem('Address', formData.address)}
             </View>

             <View style={styles.summarySection}>
               <Text style={styles.summarySubtitle}>Brand and Product Details</Text>
               {renderSummaryItem('Brand', brands.find(b => b._id === formData.brandId)?.name || '')}
               {renderSummaryItem('Product', brandProducts.find(p => p._id === formData.productId)?.name || '')}
               {renderSummaryItem('Garment Type', formData.garmentType)}
               {renderSummaryItem('Occasion', formData.occasion)}
             </View>

             <View style={styles.summarySection}>
               <Text style={styles.summarySubtitle}>Design Preferences</Text>
               {renderSummaryItem('Pattern', formData.pattern)}
               {renderSummaryItem('Fitting', formData.fitting)}
               {renderSummaryItem('Neckline', formData.neckline)}
               {renderSummaryItem('Sleeves', formData.sleeves)}
             </View>

             <View style={styles.summarySection}>
               <Text style={styles.summarySubtitle}>Measurements (inches)</Text>
               {renderSummaryItem('Chest', formData.measurements.chest)}
               {renderSummaryItem('Shoulder', formData.measurements.shoulder)}
               {renderSummaryItem('Waist', formData.measurements.waist)}
               {renderSummaryItem('Inseam', formData.measurements.inseam)}
               {renderSummaryItem('Arm Length', formData.measurements.armLength)}
               {renderSummaryItem('Leg Length', formData.measurements.legLength)}
             </View>

             <View style={styles.summarySection}>
               <Text style={styles.summarySubtitle}>Additional Details</Text>
               {renderSummaryItem('Special Instructions', formData.specialInstructions || 'None')}
               {renderSummaryItem('Delivery Preference', 
                 formData.deliveryPreference === 'homeDelivery' ? 'Home Delivery' : 'Pickup from Store'
               )}
               {renderSummaryItem('Payment Method',
                 formData.paymentMethod === 'cod' ? 'Cash on Delivery' :
                 formData.paymentMethod === 'card' ? 'Credit/Debit Card' :
                 formData.paymentMethod === 'mobileMoney' ? 'JazzCash/Easypaisa' :
                 formData.paymentMethod
               )}
               {renderSummaryItem('Consultation Date', formData.consultationDate.toLocaleDateString())}
             </View>
           </ScrollView>
         </View>
       );

     default:
       return null;
   }
 };

 return (
   <KeyboardAvoidingView 
     style={styles.container}
     behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
   >
     <ScrollView 
       style={styles.scrollView}
       showsVerticalScrollIndicator={false}
     >
       <View style={styles.header}>
         <Text style={styles.title}>Custom Order</Text>
         <Text style={styles.subtitle}>Designer ID: {designerId}</Text>
       </View>

       <ProgressBar currentStep={step} totalSteps={6} />
       
       {renderStep()}

       <View style={styles.buttonContainer}>
         {step > 1 && (
           <TouchableOpacity 
             style={[styles.button, styles.secondaryButton]} 
             onPress={handlePrev}
             disabled={loading}
           >
             <MaterialIcons name="arrow-back" size={20} color="#007AFF" />
             <Text style={styles.secondaryButtonText}>Previous</Text>
           </TouchableOpacity>
         )}
         
         {step < 6 ? (
           <TouchableOpacity 
             style={[styles.button, styles.primaryButton]} 
             onPress={handleNext}
             disabled={loading}
           >
             <Text style={styles.primaryButtonText}>Next</Text>
             <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
           </TouchableOpacity>
         ) : (
           <TouchableOpacity 
             style={[styles.button, styles.primaryButton]} 
             onPress={handleSubmit}
             disabled={loading}
           >
             {loading ? (
               <ActivityIndicator color="#FFF" />
             ) : (
               <>
                 <Text style={styles.primaryButtonText}>Place Order</Text>
                 <MaterialIcons name="check" size={20} color="#FFF" />
               </>
             )}
           </TouchableOpacity>
         )}
       </View>
     </ScrollView>
   </KeyboardAvoidingView>
 );
};

const styles = StyleSheet.create({
 container: {
   flex: 1,
   backgroundColor: '#F5F7FA',
 },
 scrollView: {
   flex: 1,
   padding: 20,
 },
 header: {
   marginBottom: 24,
 },
 title: {
   fontSize: 28,
   fontWeight: '700',
   color: '#1A1A1A',
   marginBottom: 8,
 },
 subtitle: {
   fontSize: 16,
   color: '#666',
   fontWeight: '500',
 },
 progressContainer: {
   marginBottom: 24,
 },
 progressBar: {
   height: 6,
   backgroundColor: '#E5E7EB',
   borderRadius: 3,
   overflow: 'hidden',
   marginBottom: 8,
 },
 progressFill: {
   height: '100%',
   backgroundColor: '#007AFF',
   borderRadius: 3,
 },
 progressText: {
   fontSize: 14,
   color: '#666',
   textAlign: 'center',
 },
 stepTitle: {
   fontSize: 22,
   fontWeight: '600',
   color: '#1A1A1A',
   marginBottom: 20,
 },
 inputContainer: {
   marginBottom: 16,
 },
 inputLabel: {
   fontSize: 16,
   fontWeight: '500',
   color: '#1A1A1A',
   marginBottom: 8,
 },
 input: {
   backgroundColor: '#FFFFFF',
   borderWidth: 1,
   borderColor: '#E5E7EB',
   borderRadius: 8,
   padding: 12,
   fontSize: 16,
   color: '#1A1A1A',
 },
 multilineInput: {
   height: 100,
   textAlignVertical: 'top',
 },
 inputError: {
   borderColor: '#DC2626',
 },
 errorText: {
   color: '#DC2626',
   fontSize: 14,
   marginTop: 4,
 },
 pickerContainer: {
   marginBottom: 16,
 },
 pickerWrapper: {
   backgroundColor: '#FFFFFF',
   borderWidth: 1,
   borderColor: '#E5E7EB',
   borderRadius: 8,
   overflow: 'hidden',
 },
 picker: {
   height: 50,
 },
 pickerItem: {
   fontSize: 16,
 },
 productImageScroll: {
   height: 100,
   marginTop: 8,
 },
 productImageContainer: {
   flexDirection: 'row',
   paddingHorizontal: 4,
 },
 productImage: {
   width: 80,
   height: 80,
   borderRadius: 8,
   marginRight: 8,
   borderWidth: 1,
   borderColor: '#E5E7EB',
 },
 datePickerButton: {
   backgroundColor: '#FFFFFF',
   borderWidth: 1,
   borderColor: '#E5E7EB',
   borderRadius: 8,
   padding: 12,
 },
 datePickerText: {
   fontSize: 16,
   color: '#1A1A1A',
 },
 buttonContainer: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   marginTop: 24,
   marginBottom: 40,
 },
 button: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'center',
   padding: 14,
   borderRadius: 8,
   minWidth: 120,
 },
 primaryButton: {
  backgroundColor: '#007AFF',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
secondaryButton: {
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#007AFF',
},
primaryButtonText: {
  color: '#FFFFFF',
  fontSize: 16,
  fontWeight: '600',
  marginRight: 8,
},
secondaryButtonText: {
  color: '#007AFF',
  fontSize: 16,
  fontWeight: '600',
  marginLeft: 8,
},
summaryContainer: {
  maxHeight: 400,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E5E7EB',
  borderRadius: 8,
  padding: 16,
},
summarySection: {
  marginBottom: 20,
  paddingBottom: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#E5E7EB',
},
summarySubtitle: {
  fontSize: 18,
  fontWeight: '600',
  color: '#1A1A1A',
  marginBottom: 12,
  paddingBottom: 8,
  borderBottomWidth: 1,
  borderBottomColor: '#E5E7EB',
},
summaryRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 8,
  paddingHorizontal: 4,
},
summaryLabel: {
  fontSize: 16,
  color: '#4B5563',
  fontWeight: '500',
  flex: 1,
},
summaryValue: {
  fontSize: 16,
  color: '#1A1A1A',
  fontWeight: '400',
  flex: 2,
  textAlign: 'right',
},
measurementNote: {
  fontSize: 14,
  color: '#666',
  fontStyle: 'italic',
  marginBottom: 16,
},
specialInstructionsInput: {
  height: 120,
  textAlignVertical: 'top',
},
dateContainer: {
  marginBottom: 16,
},
brandProductContainer: {
  backgroundColor: '#F9FAFB',
  padding: 12,
  borderRadius: 8,
  marginBottom: 16,
},
brandProductTitle: {
  fontSize: 16,
  fontWeight: '500',
  color: '#1A1A1A',
  marginBottom: 8,
},
loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
errorContainer: {
  padding: 16,
  backgroundColor: '#FEE2E2',
  borderRadius: 8,
  marginBottom: 16,
},
errorMessage: {
  color: '#DC2626',
  fontSize: 14,
  textAlign: 'center',
},
disabledButton: {
  opacity: 0.5,
},
productList: {
  maxHeight: 200,
},
productItem: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 12,
  borderBottomWidth: 1,
  borderBottomColor: '#E5E7EB',
},
selectedProduct: {
  backgroundColor: '#F3F4F6',
},
productItemImage: {
  width: 60,
  height: 60,
  borderRadius: 4,
  marginRight: 12,
},
placeholderImage: {
  width: 60,
  height: 60,
  borderRadius: 4,
  backgroundColor: '#E5E7EB',
  marginRight: 12,
},
productItemContent: {
  flex: 1,
  marginRight: 8,
},
productItemText: {
  fontSize: 16,
  color: '#1A1A1A',
},
selectedProductText: {
  fontWeight: '600',
},
selectedIcon: {
  marginLeft: 8,
},
productListFooter: {
  padding: 12,
  borderTopWidth: 1,
  borderTopColor: '#E5E7EB',
  backgroundColor: '#F9FAFB',
},
productCountText: {
  fontSize: 14,
  color: '#6B7280',
  textAlign: 'center',
},

});

export default DesignerOrderScreen;

