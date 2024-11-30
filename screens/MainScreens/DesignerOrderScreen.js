import React, { useState, useCallback } from 'react';
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

const CustomPicker = ({ label, items, error, ...props }) => (
  <View style={styles.pickerContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={[styles.pickerWrapper, error && styles.inputError]}>
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
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const DesignerOrderScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { designerId, user } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    designerId: designerId,
    userId: user._id,
    fullName: '',
    phone: '',
    email: '',
    address: '',
    garmentType: '',
    occasion: '',
    fabric: '',
    color: '',
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

  const [showDatePicker, setShowDatePicker] = useState(false);

  const updateFormData = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when field is updated
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
        if (!formData.garmentType) newErrors.garmentType = 'Please select a garment type';
        if (!formData.occasion) newErrors.occasion = 'Please select an occasion';
        if (!formData.fabric) newErrors.fabric = 'Please select a fabric';
        break;
      case 3:
        if (!formData.color) newErrors.color = 'Color is required';
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
      console.log('Submitting order with data:', JSON.stringify(orderData, null, 2));
      
      const response = await fetch(`${API_URL}/custom-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any authentication headers if required
          // 'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(orderData)
      });
  
      const data = await response.json();
      console.log('API Response:', {
        status: response.status,
        statusTdext: response.statusText,
        data
      });
  
      if (!response.ok) {
        // Log detailed error informationd
        console.error('Order submission failed:', {
          status: response.status,
          statusText: response.statusText,
          error: data
        });
        
        // Provide more specific error messages based on status codes
        switch (response.status) {
          case 400:
            throw new Error(data.error || 'Invalid order data. Please check your inputs.');
          case 401:
            throw new Error('Authentication required. Please log in again.');
          case 403:
            throw new Error('You are not authorized to place this order.');
          case 409:
            throw new Error('This order conflicts with an existing order.');
          case 500:
            throw new Error('Server error. Please try again later.');
          default:
            throw new Error(data.error || 'Failed to submit order. Please try again.');
        }
      }
  
      return data;
    } catch (error) {
      // Log the complete error object for debugging
      console.error('Order submission error:', {
        message: error.message,
        stack: error.stack,
        originalError: error
      });
      
      // Rethrow a user-friendly error message
      throw new Error(
        error.message || 'There was a problem submitting your order. Please try again.'
      );
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
                    onPress: () => navigation.navigate('Designers'),
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
            <Text style={styles.stepTitle}>Garment Details</Text>
            <CustomPicker
              label="Garment Type"
              selectedValue={formData.garmentType}
              onValueChange={(itemValue) => updateFormData('garmentType', itemValue)}
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
              onValueChange={(itemValue) => updateFormData('occasion', itemValue)}
              items={[
                { label: "Select Occasion", value: "" },
                { label: "Casual Wear", value: "casual" },
                { label: "Eid", value: "eid" },
                { label: "Wedding", value: "wedding" },
                { label: "Formal Event", value: "formal" },
              ]}
              error={errors.occasion}
            />
            <CustomPicker
              label="Fabric"
              selectedValue={formData.fabric}
              onValueChange={(itemValue) => updateFormData('fabric', itemValue)}
              items={[
                { label: "Select Fabric", value: "" },
                { label: "Cotton", value: "cotton" },
                { label: "Linen", value: "linen" },
                { label: "Silk", value: "silk" },
                { label: "Khaddar", value: "khaddar" },
              ]}
              error={errors.fabric}
            />
          </View>
        );
      case 3:
        return (
          <View>
            <Text style={styles.stepTitle}>Design Preferences</Text>
            <FormInput
              label="Color"
              placeholder="Enter preferred color"
              value={formData.color}
              onChangeText={(text) => updateFormData('color', text)}
            />
            <CustomPicker
              label="Pattern"
              selectedValue={formData.pattern}
              onValueChange={(itemValue) => updateFormData('pattern', itemValue)}
              items={[
                { label: "Select Pattern", value: "" },
                { label: "Solid", value: "solid" },
                { label: "Floral", value: "floral" },
                { label: "Geometric", value: "geometric" },
                { label: "Striped", value: "striped" },
              ]}
            />
            <CustomPicker
              label="Fitting"
              selectedValue={formData.fitting}
              onValueChange={(itemValue) => updateFormData('fitting', itemValue)}
              items={[
                { label: "Select Fitting", value: "" },
                { label: "Regular", value: "regular" },
                { label: "Slim", value: "slim" },
                { label: "Loose", value: "loose" },
              ]}
            />
          </View>
        );
        case 4:
          return (
            <View>
              <Text style={styles.stepTitle}>Measurements</Text>
              <FormInput
                label="Chest"
                placeholder="Enter chest measurement"
                value={formData.measurements.chest}
                onChangeText={(text) => setFormData(prevState => ({
                  ...prevState,
                  measurements: {
                    ...prevState.measurements,
                    chest: text
                  }
                }))}
                keyboardType="numeric"
              />
              <FormInput
                label="Shoulder"
                placeholder="Enter shoulder measurement"
                value={formData.measurements.shoulder}
                onChangeText={(text) => setFormData(prevState => ({
                  ...prevState,
                  measurements: {
                    ...prevState.measurements,
                    shoulder: text
                  }
                }))}
                keyboardType="numeric"
              />
              <FormInput
                label="Waist"
                placeholder="Enter waist measurement"
                value={formData.measurements.waist}
                onChangeText={(text) => setFormData(prevState => ({
                  ...prevState,
                  measurements: {
                    ...prevState.measurements,
                    waist: text
                  }
                }))}
                keyboardType="numeric"
              />
              <FormInput
                label="Inseam"
                placeholder="Enter inseam measurement"
                value={formData.measurements.inseam}
                onChangeText={(text) => setFormData(prevState => ({
                  ...prevState,
                  measurements: {
                    ...prevState.measurements,
                    inseam: text
                  }
                }))}
                keyboardType="numeric"
              />
              <FormInput
                label="Arm Length"
                placeholder="Enter arm length measurement"
                value={formData.measurements.armLength}
                onChangeText={(text) => setFormData(prevState => ({
                  ...prevState,
                  measurements: {
                    ...prevState.measurements,
                    armLength: text
                  }
                }))}
                keyboardType="numeric"
              />
              <FormInput
                label="Leg Length"
                placeholder="Enter leg length measurement"
                value={formData.measurements.legLength}
                onChangeText={(text) => setFormData(prevState => ({
                  ...prevState,
                  measurements: {
                    ...prevState.measurements,
                    legLength: text
                  }
                }))}
                keyboardType="numeric"
              />
            </View>
          );
      case 5:
        return (
          <View>
            <Text style={styles.stepTitle}>Additional Details</Text>
            <FormInput
              label="Special Instructions"
              placeholder="Enter any special instructions"
              value={formData.specialInstructions}
              onChangeText={(text) => updateFormData('specialInstructions', text)}
              multiline
              numberOfLines={3}
            />
            <CustomPicker
              label="Delivery Preference"
              selectedValue={formData.deliveryPreference}
              onValueChange={(itemValue) => updateFormData('deliveryPreference', itemValue)}
              items={[
                { label: "Select Delivery Preference", value: "" },
                { label: "Home Delivery", value: "homeDelivery" },
                { label: "Pickup from Designer", value: "pickup" },
              ]}
            />
            <CustomPicker
              label="Payment Method"
              selectedValue={formData.paymentMethod}
              onValueChange={(itemValue) => updateFormData('paymentMethod', itemValue)}
              items={[
                { label: "Select Payment Method", value: "" },
                { label: "Cash on Delivery", value: "cod" },
                { label: "Credit/Debit Card", value: "card" },
                { label: "JazzCash/Easypaisa", value: "mobileMoney" },
              ]}
            />
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Text style={styles.datePickerText}>
                Consultation Date: {formData.consultationDate.toDateString()}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.consultationDate}
                mode="date"
                display="default"
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
                <Text style={styles.summarySubtitle}>Garment Details</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Garment Type:</Text>
                  <Text style={styles.summaryValue}>
                    {formData.garmentType === 'shalwarKameez' ? 'Shalwar Kameez' :
                     formData.garmentType === 'kurtaPajama' ? 'Kurta Pajama' :
                     formData.garmentType === 'sherwani' ? 'Sherwani' :
                     formData.garmentType === 'waistcoat' ? 'Waistcoat' :
                     formData.garmentType}
                  </Text>
                </View>
                {renderSummaryItem('Occasion', formData.occasion)}
                {renderSummaryItem('Fabric', formData.fabric)}
              </View>

              <View style={styles.summarySection}>
                <Text style={styles.summarySubtitle}>Design Preferences</Text>
                {renderSummaryItem('Color', formData.color)}
                {renderSummaryItem('Pattern', formData.pattern)}
                {renderSummaryItem('Fitting', formData.fitting)}
              </View>

              <View style={styles.summarySection}>
                <Text style={styles.summarySubtitle}>Measurements</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Chest:</Text>
                  <Text style={styles.summaryValue}>{formData.measurements.chest}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Shoulder:</Text>
                  <Text style={styles.summaryValue}>{formData.measurements.shoulder}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Waist:</Text>
                  <Text style={styles.summaryValue}>{formData.measurements.waist}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Inseam:</Text>
                  <Text style={styles.summaryValue}>{formData.measurements.inseam}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Arm Length:</Text>
                  <Text style={styles.summaryValue}>{formData.measurements.armLength}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Leg Length:</Text>
                  <Text style={styles.summaryValue}>{formData.measurements.legLength}</Text>
                </View>
              </View>

              <View style={styles.summarySection}>
                <Text style={styles.summarySubtitle}>Additional Details</Text>
                {renderSummaryItem('Special Instructions', formData.specialInstructions)}
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery Preference:</Text>
                  <Text style={styles.summaryValue}>
                    {formData.deliveryPreference === 'homeDelivery' ? 'Home Delivery' :
                     formData.deliveryPreference === 'pickup' ? 'Pickup from Designer' :
                     formData.deliveryPreference}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Payment Method:</Text>
                  <Text style={styles.summaryValue}>
                    {formData.paymentMethod === 'cod' ? 'Cash on Delivery' :
                     formData.paymentMethod === 'card' ? 'Credit/Debit Card' :
                     formData.paymentMethod === 'mobileMoney' ? 'JazzCash/Easypaisa' :
                     formData.paymentMethod}
                  </Text>
                </View>
                {renderSummaryItem('Consultation Date', formData.consultationDate.toDateString())}
              </View>
            </ScrollView>
          </View>
        );
      default:
        return null;
      // ... Other step cases remain the same ...
    };
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
  datePickerText: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1A1A1A',
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
  },
  summarySubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
});

export default DesignerOrderScreen;