import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const FinancialAnalysisScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [analysisData, setAnalysisData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const periods = [
    { key: '3months', label: '3 mois', value: 3 },
    { key: '6months', label: '6 mois', value: 6 },
    { key: '12months', label: '1 an', value: 12 },
    { key: '24months', label: '2 ans', value: 24 },
  ];

  useEffect(() => {
    loadFinancialAnalysis();
    
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedPeriod]);

  const loadFinancialAnalysis = async () => {
    try {
      setIsLoading(true);
      
      // Simuler le chargement de l'analyse financière
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockAnalysis = {
        period: selectedPeriod,
        summary: {
          totalIncome: 18750,
          totalExpenses: 12340,
          netIncome: 6410,
          savingsRate: 34.2,
          debtRatio: 23.5,
          creditScore: 720,
        },
        incomeAnalysis: {
          salary: 15000,
          bonuses: 2250,
          investments: 1000,
          other: 500,
          stability: 'Très stable',
          trend: 'Croissant',
        },
        expenseAnalysis: {
          housing: 4500,
          food: 1200,
          transportation: 800,
          insurance: 650,
          entertainment: 900,
          other: 4290,
          categories: [
            { name: 'Logement', amount: 4500, percentage: 36.5, color: '#FF6B6B' },
            { name: 'Autre', amount: 4290, percentage: 34.8, color: '#4ECDC4' },
            { name: 'Alimentation', amount: 1200, percentage: 9.7, color: '#45B7D1' },
            { name: 'Divertissement', amount: 900, percentage: 7.3, color: '#96CEB4' },
            { name: 'Transport', amount: 800, percentage: 6.5, color: '#FFEAA7' },
            { name: 'Assurance', amount: 650, percentage: 5.3, color: '#DDA0DD' },
          ],
        },
        creditCapacity: {
          maxLoanAmount: 320000,
          maxMonthlyPayment: 2100,
          recommendedLoanAmount: 280000,
          riskLevel: 'Faible',
          eligibilityScore: 85,
        },
        recommendations: [
          {
            type: 'optimization',
            title: 'Optimisez vos dépenses de divertissement',
            description: 'Réduire de 200€/mois augmenterait votre capacité d\'emprunt de 35,000€',
            impact: 'positive',
            priority: 'medium',
          },
          {
            type: 'savings',
            title: 'Excellent taux d\'épargne',
            description: 'Votre taux d\'épargne de 34.2% est exemplaire',
            impact: 'positive',
            priority: 'low',
          },
          {
            type: 'debt',
            title: 'Ratio d\'endettement optimal',
            description: 'Votre ratio de 23.5% vous permet d\'emprunter davantage',
            impact: 'positive',
            priority: 'high',
          },
        ],
        trends: {
          incomeGrowth: 8.5,
          expenseGrowth: 3.2,
          savingsGrowth: 22.1,
        },
        bankingBehavior: {
          averageBalance: 12500,
          overdrafts: 0,
          regularSavings: true,
          paymentHistory: 'Excellent',
        },
      };

      setAnalysisData(mockAnalysis);
    } catch (error) {
      console.error('Error loading financial analysis:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'analyse financière');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFinancialAnalysis();
    setRefreshing(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#34C759';
    if (score >= 60) return '#FF9500';
    return '#FF3B30';
  };

  const getRiskColor = (risk) => {
    switch (risk.toLowerCase()) {
      case 'faible': return '#34C759';
      case 'moyen': return '#FF9500';
      case 'élevé': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderSummaryCards = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, styles.incomeCard]}>
          <Text style={styles.summaryIcon}>💰</Text>
          <Text style={styles.summaryLabel}>Revenus</Text>
          <Text style={styles.summaryValue}>{formatCurrency(analysisData.summary.totalIncome)}</Text>
          <Text style={styles.summaryPeriod}>/{periods.find(p => p.key === selectedPeriod)?.label}</Text>
        </View>
        
        <View style={[styles.summaryCard, styles.expenseCard]}>
          <Text style={styles.summaryIcon}>💸</Text>
          <Text style={styles.summaryLabel}>Dépenses</Text>
          <Text style={styles.summaryValue}>{formatCurrency(analysisData.summary.totalExpenses)}</Text>
          <Text style={styles.summaryPeriod}>/{periods.find(p => p.key === selectedPeriod)?.label}</Text>
        </View>
      </View>
      
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, styles.netCard]}>
          <Text style={styles.summaryIcon}>📈</Text>
          <Text style={styles.summaryLabel}>Épargne nette</Text>
          <Text style={styles.summaryValue}>{formatCurrency(analysisData.summary.netIncome)}</Text>
          <Text style={styles.summarySubtext}>{analysisData.summary.savingsRate}% du revenu</Text>
        </View>
        
        <View style={[styles.summaryCard, styles.scoreCard]}>
          <Text style={styles.summaryIcon}>🎯</Text>
          <Text style={styles.summaryLabel}>Score crédit</Text>
          <Text style={[styles.summaryValue, { color: getScoreColor(analysisData.summary.creditScore) }]}>
            {analysisData.summary.creditScore}
          </Text>
          <Text style={styles.summarySubtext}>Excellent</Text>
        </View>
      </View>
    </View>
  );

  const renderExpenseBreakdown = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Répartition des dépenses</Text>
      <View style={styles.expenseChart}>
        {analysisData.expenseAnalysis.categories.map((category, index) => (
          <View key={index} style={styles.expenseItem}>
            <View style={styles.expenseInfo}>
              <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
              <Text style={styles.categoryName}>{category.name}</Text>
            </View>
            <View style={styles.expenseAmount}>
              <Text style={styles.categoryAmount}>{formatCurrency(category.amount)}</Text>
              <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderCreditCapacity = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Capacité d'emprunt</Text>
      <View style={styles.capacityContainer}>
        <View style={styles.capacityCard}>
          <Text style={styles.capacityLabel}>Montant maximum</Text>
          <Text style={styles.capacityValue}>{formatCurrency(analysisData.creditCapacity.maxLoanAmount)}</Text>
        </View>
        
        <View style={styles.capacityCard}>
          <Text style={styles.capacityLabel}>Mensualité max</Text>
          <Text style={styles.capacityValue}>{formatCurrency(analysisData.creditCapacity.maxMonthlyPayment)}</Text>
        </View>
        
        <View style={styles.capacityCard}>
          <Text style={styles.capacityLabel}>Montant recommandé</Text>
          <Text style={[styles.capacityValue, { color: '#34C759' }]}>
            {formatCurrency(analysisData.creditCapacity.recommendedLoanAmount)}
          </Text>
        </View>
        
        <View style={styles.capacityCard}>
          <Text style={styles.capacityLabel}>Niveau de risque</Text>
          <Text style={[styles.capacityValue, { color: getRiskColor(analysisData.creditCapacity.riskLevel) }]}>
            {analysisData.creditCapacity.riskLevel}
          </Text>
        </View>
      </View>
      
      <View style={styles.eligibilityContainer}>
        <Text style={styles.eligibilityLabel}>Score d'éligibilité</Text>
        <View style={styles.eligibilityBar}>
          <View 
            style={[
              styles.eligibilityFill, 
              { 
                width: `${analysisData.creditCapacity.eligibilityScore}%`,
                backgroundColor: getScoreColor(analysisData.creditCapacity.eligibilityScore)
              }
            ]} 
          />
        </View>
        <Text style={styles.eligibilityScore}>{analysisData.creditCapacity.eligibilityScore}/100</Text>
      </View>
    </View>
  );

  const renderRecommendations = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recommandations personnalisées</Text>
      {analysisData.recommendations.map((rec, index) => (
        <View key={index} style={[styles.recommendationCard, styles[`${rec.impact}Recommendation`]]}>
          <View style={styles.recommendationHeader}>
            <Text style={styles.recommendationIcon}>
              {rec.type === 'optimization' ? '⚡' : rec.type === 'savings' ? '💡' : '📊'}
            </Text>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>{rec.title}</Text>
              <View style={[styles.priorityBadge, styles[`${rec.priority}Priority`]]}>
                <Text style={styles.priorityText}>
                  {rec.priority === 'high' ? 'Priorité haute' : 
                   rec.priority === 'medium' ? 'Priorité moyenne' : 'Priorité faible'}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.recommendationDescription}>{rec.description}</Text>
        </View>
      ))}
    </View>
  );

  const renderTrends = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tendances financières</Text>
      <View style={styles.trendsContainer}>
        <View style={styles.trendItem}>
          <Text style={styles.trendLabel}>Croissance des revenus</Text>
          <Text style={[styles.trendValue, { color: '#34C759' }]}>+{analysisData.trends.incomeGrowth}%</Text>
        </View>
        
        <View style={styles.trendItem}>
          <Text style={styles.trendLabel}>Évolution des dépenses</Text>
          <Text style={[styles.trendValue, { color: '#FF9500' }]}>+{analysisData.trends.expenseGrowth}%</Text>
        </View>
        
        <View style={styles.trendItem}>
          <Text style={styles.trendLabel}>Croissance de l'épargne</Text>
          <Text style={[styles.trendValue, { color: '#34C759' }]}>+{analysisData.trends.savingsGrowth}%</Text>
        </View>
      </View>
    </View>
  );

  const renderBankingBehavior = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Comportement bancaire</Text>
      <View style={styles.behaviorContainer}>
        <View style={styles.behaviorItem}>
          <Text style={styles.behaviorLabel}>Solde moyen</Text>
          <Text style={styles.behaviorValue}>{formatCurrency(analysisData.bankingBehavior.averageBalance)}</Text>
        </View>
        
        <View style={styles.behaviorItem}>
          <Text style={styles.behaviorLabel}>Découverts</Text>
          <Text style={[styles.behaviorValue, { color: '#34C759' }]}>
            {analysisData.bankingBehavior.overdrafts} incident
          </Text>
        </View>
        
        <View style={styles.behaviorItem}>
          <Text style={styles.behaviorLabel}>Épargne régulière</Text>
          <Text style={[styles.behaviorValue, { color: '#34C759' }]}>
            {analysisData.bankingBehavior.regularSavings ? 'Oui' : 'Non'}
          </Text>
        </View>
        
        <View style={styles.behaviorItem}>
          <Text style={styles.behaviorLabel}>Historique de paiement</Text>
          <Text style={[styles.behaviorValue, { color: '#34C759' }]}>
            {analysisData.bankingBehavior.paymentHistory}
          </Text>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingIcon}>📊</Text>
        <Text style={styles.loadingText}>Analyse en cours...</Text>
        <Text style={styles.loadingSubtext}>Traitement de vos données financières</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analyse financière</Text>
        <TouchableOpacity style={styles.shareButton} onPress={() => Alert.alert('Partage', 'Fonctionnalité de partage à venir')}>
          <Text style={styles.shareButtonText}>↗</Text>
        </TouchableOpacity>
      </View>

      {/* Period Filter */}
      <View style={styles.periodContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text style={[
                styles.periodText,
                selectedPeriod === period.key && styles.periodTextActive,
              ]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          {analysisData && (
            <>
              {renderSummaryCards()}
              {renderExpenseBreakdown()}
              {renderCreditCapacity()}
              {renderRecommendations()}
              {renderTrends()}
              {renderBankingBehavior()}
            </>
          )}
        </Animated.View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('CreditApplication')}
        >
          <Text style={styles.actionButtonText}>Faire une demande</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('FinancialAdvice')}
        >
          <Text style={styles.secondaryButtonText}>Conseils personnalisés</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  periodContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  periodText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  periodTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  summaryContainer: {
    padding: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryPeriod: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  summarySubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  expenseChart: {
    marginTop: 10,
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  expenseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  expenseAmount: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#666',
  },
  capacityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  capacityCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  capacityLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  capacityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  eligibilityContainer: {
    marginTop: 10,
  },
  eligibilityLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  eligibilityBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 5,
  },
  eligibilityFill: {
    height: '100%',
    borderRadius: 4,
  },
  eligibilityScore: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  recommendationCard: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  positiveRecommendation: {
    backgroundColor: '#f0f9f0',
    borderLeftColor: '#34C759',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  highPriority: {
    backgroundColor: '#ffebee',
  },
  mediumPriority: {
    backgroundColor: '#fff8e1',
  },
  lowPriority: {
    backgroundColor: '#e8f5e8',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  trendsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  trendItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  trendLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  trendValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  behaviorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  behaviorItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  behaviorLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  behaviorValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  actionContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginRight: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FinancialAnalysisScreen;