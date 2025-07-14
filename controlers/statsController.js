import Patient from '../models/patient.js';
import Medecin from '../models/Medecin.js';
import RendezVous from '../models/RendezVous.js';
import Consultation from '../models/Consultation.js';

// Get comprehensive dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    // Patient statistics
    const totalPatients = await Patient.countDocuments();
    const newPatientsThisMonth = await Patient.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    const patientsByDiabetesType = await Patient.aggregate([
      {
        $group: {
          _id: '$diabete',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Medecin statistics
    const totalMedecins = await Medecin.countDocuments();
    const availableMedecins = await Medecin.countDocuments({ status: 'En service' });
    const medecinsBySpeciality = await Medecin.aggregate([
      {
        $group: {
          _id: '$specialite',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Rendez-vous statistics
    const totalRendezVous = await RendezVous.countDocuments();
    const todayRendezVous = await RendezVous.countDocuments({
      date: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999))
      }
    });
    const thisMonthRendezVous = await RendezVous.countDocuments({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    const rendezVousByStatus = await RendezVous.aggregate([
      {
        $group: {
          _id: '$statut',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Consultation statistics
    const totalConsultations = await Consultation.countDocuments();
    const thisMonthConsultations = await Consultation.countDocuments({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    const totalRevenue = await Consultation.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$montant' }
        }
      }
    ]);
    const thisMonthRevenue = await Consultation.aggregate([
      {
        $match: {
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$montant' }
        }
      }
    ]);
    
    // Age distribution
    const ageDistribution = await Patient.aggregate([
      {
        $group: {
          _id: {
            $cond: [
              { $lt: ['$age', 30] },
              '18-29',
              {
                $cond: [
                  { $lt: ['$age', 50] },
                  '30-49',
                  {
                    $cond: [
                      { $lt: ['$age', 70] },
                      '50-69',
                      '70+'
                    ]
                  }
                ]
              }
            ]
          },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Monthly trends
    const monthlyTrends = await Consultation.aggregate([
      {
        $match: {
          date: { $gte: startOfYear }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          consultations: { $sum: 1 },
          revenue: { $sum: '$montant' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Recent activity
    const recentPatients = await Patient.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('nom prenom age diabete createdAt');
    
    const recentConsultations = await Consultation.find()
      .populate('patientId', 'nom prenom')
      .populate('medecinId', 'nom prenom')
      .sort({ date: -1 })
      .limit(5)
      .select('date type patientId medecinId montant');
    
    const upcomingRendezVous = await RendezVous.find({
      date: { $gte: today },
      statut: { $in: ['Confirmé', 'En attente'] }
    })
      .populate('patientId', 'nom prenom')
      .populate('medecinId', 'nom prenom')
      .sort({ date: 1, heure: 1 })
      .limit(5);
    
    // Diagnostic operation types
    const operationTypes = await Patient.aggregate([
      { $group: { _id: '$diagnostic.typeOperation', count: { $sum: 1 } } }
    ]);
    const operationLaterality = await Patient.aggregate([
      { $group: { _id: '$diagnostic.laterality', count: { $sum: 1 } } }
    ]);
    const operationReprise = await Patient.aggregate([
      { $group: { _id: '$diagnostic.reprise', count: { $sum: 1 } } }
    ]);
    // Risk factors
    const riskFactors = await Patient.aggregate([
      { $group: {
        _id: null,
        hta: { $sum: { $cond: ['$diagnostic.facteursRisque.hta', 1, 0] } },
        diabete: { $sum: { $cond: ['$diagnostic.facteursRisque.diabete', 1, 0] } },
        tabac: { $sum: { $cond: ['$diagnostic.facteursRisque.tabac', 1, 0] } },
        cancer: { $sum: { $cond: ['$diagnostic.facteursRisque.cancer', 1, 0] } },
        dyslipidemie: { $sum: { $cond: ['$diagnostic.facteursRisque.dyslipidemie', 1, 0] } },
        obesite: { $sum: { $cond: ['$diagnostic.facteursRisque.obesite', 1, 0] } }
      }}
    ]);
    // Antécédents médicaux
    const antecedentsMedicaux = await Patient.aggregate([
      { $group: {
        _id: null,
        angorEffort: { $sum: { $cond: ['$antecedents.medicauxDetails.angorEffort', 1, 0] } },
        sca: { $sum: { $cond: ['$antecedents.medicauxDetails.sca', 1, 0] } },
        idm: { $sum: { $cond: ['$antecedents.medicauxDetails.idm', 1, 0] } },
        aomi: { $sum: { $cond: ['$antecedents.medicauxDetails.aomi', 1, 0] } },
        avc: { $sum: { $cond: ['$antecedents.medicauxDetails.avc', 1, 0] } }
      }}
    ]);
    // Antécédents chirurgicaux
    const amputationAnterieure = await Patient.aggregate([
      { $group: { _id: '$antecedents.chirurgicauxDetails.amputationAnterieure', count: { $sum: 1 } } }
    ]);
    const amputationFamiliale = await Patient.aggregate([
      { $group: { _id: '$antecedents.chirurgicauxDetails.amputationFamiliale', count: { $sum: 1 } } }
    ]);
    // Maladie cardiovasculaire
    const maladieCardioTypes = await Patient.aggregate([
      { $group: { _id: '$diagnostic.maladieCardiovasculaire', count: { $sum: 1 } } }
    ]);
    const maladieCardioFE = await Patient.aggregate([
      { $match: { 'diagnostic.maladieCardiovasculaireFE': { $ne: '' } } },
      { $group: { _id: '$diagnostic.maladieCardiovasculaireFE', count: { $sum: 1 } } }
    ]);
    // Sex
    const sexDistribution = await Patient.aggregate([
      { $group: { _id: '$sexe', count: { $sum: 1 } } }
    ]);
    
    // === DÉFINITION DES SEMAINES ===
    const weeks = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(start.getDate() - start.getDay() - i * 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      weeks.push({ start, end });
    }

    // === CONSULTATIONS & URGENCES PAR SEMAINE (RendezVous réels) ===
    const consultationsUrgencesData = [];
    for (const { start, end } of weeks) {
      const rdvs = await RendezVous.find({
        date: { $gte: start, $lte: end },
        statut: { $in: ['Confirmé', 'Terminé'] }
      });
      let consultations = 0, urgences = 0;
      rdvs.forEach(rdv => {
        if (rdv.type === 'Urgence') urgences++;
        else if (rdv.type === 'Consultation') consultations++;
      });
      consultationsUrgencesData.push({ week: `${start.getDate()}/${start.getMonth() + 1}`, consultations, urgences });
    }

    // === MÉDECINS EN SERVICE PAR SEMAINE ===
    // Si statusHistory existe, utiliser l'historique, sinon prendre le statut actuel
    const medecins = await Medecin.find();
    let medecinsServiceData = [];
    if (medecins.length && medecins[0].statusHistory) {
      // Historique par semaine
      medecinsServiceData = weeks.map(({ start, end }) => {
        let enService = 0;
        medecins.forEach(m => {
          let last = null;
          if (m.statusHistory && m.statusHistory.length > 0) {
            last = m.statusHistory.filter(h => h.date <= end).sort((a, b) => b.date - a.date)[0];
          }
          const status = last ? last.status : (m.createdAt <= end ? m.status : null);
          if (status === 'En service') enService++;
        });
        return { week: `${start.getDate()}/${start.getMonth() + 1}`, enService };
      });
    } else {
      // Statut actuel
      const enService = medecins.filter(m => m.status === 'En service').length;
      medecinsServiceData = weeks.map(({ start }) => ({ week: `${start.getDate()}/${start.getMonth() + 1}`, enService }));
    }

    // === ÉVOLUTION DES STATUTS PATIENTS PAR SEMAINE ===
    const allPatients = await Patient.find({}, { statutHistory: 1, statut: 1, createdAt: 1 });
    const statuts = ['nouveau', 'sous_trt', 'apres_trt', 'decede'];
    const patientsEvolutionData = weeks.map(({ start, end }) => {
      const weekLabel = `${start.getDate()}/${start.getMonth() + 1}`;
      const statusCount = { week: weekLabel };
      statuts.forEach(s => statusCount[s] = 0);
      allPatients.forEach(patient => {
        let last = null;
        if (patient.statutHistory && patient.statutHistory.length > 0) {
          last = patient.statutHistory.filter(h => h.date <= end).sort((a, b) => b.date - a.date)[0];
        }
        const statut = last ? last.statut : (patient.createdAt <= end ? patient.statut : null);
        if (statut && statuts.includes(statut)) {
          statusCount[statut]++;
        }
      });
      return statusCount;
    });

    res.json({
      overview: {
        totalPatients,
        totalMedecins,
        totalRendezVous,
        totalConsultations,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      thisMonth: {
        newPatients: newPatientsThisMonth,
        rendezVous: thisMonthRendezVous,
        consultations: thisMonthConsultations,
        revenue: thisMonthRevenue[0]?.total || 0
      },
      today: {
        rendezVous: todayRendezVous
      },
      breakdowns: {
        patientsByDiabetesType,
        medecinsBySpeciality,
        rendezVousByStatus,
        ageDistribution,
        operationTypes,
        operationLaterality,
        operationReprise,
        riskFactors: riskFactors[0] || {},
        antecedentsMedicaux: antecedentsMedicaux[0] || {},
        amputationAnterieure,
        amputationFamiliale,
        maladieCardioTypes,
        maladieCardioFE,
        sexDistribution
      },
      trends: {
        monthly: monthlyTrends
      },
      recentActivity: {
        patients: recentPatients,
        consultations: recentConsultations,
        upcomingRendezVous
      },
      availability: {
        availableMedecins,
        unavailableMedecins: totalMedecins - availableMedecins
      },
      patientsEvolutionData,
      consultationsUrgencesData,
      medecinsServiceData
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
};

// Get patient statistics
export const getPatientStats = async (req, res) => {
  try {
    const stats = await Patient.aggregate([
      {
        $group: {
          _id: '$diabete',
          count: { $sum: 1 },
          avgAge: { $avg: '$age' }
        }
      }
    ]);
    
    const totalPatients = await Patient.countDocuments();
    const recentPatients = await Patient.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    const ageDistribution = await Patient.aggregate([
      {
        $group: {
          _id: {
            $cond: [
              { $lt: ['$age', 30] },
              '18-29',
              {
                $cond: [
                  { $lt: ['$age', 50] },
                  '30-49',
                  {
                    $cond: [
                      { $lt: ['$age', 70] },
                      '50-69',
                      '70+'
                    ]
                  }
                ]
              }
            ]
          },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const genderDistribution = await Patient.aggregate([
      {
        $group: {
          _id: '$sexe',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      totalPatients,
      recentPatients,
      byDiabetesType: stats,
      ageDistribution,
      genderDistribution
    });
  } catch (error) {
    console.error('Error fetching patient stats:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
};

// Get medecin statistics
export const getMedecinStats = async (req, res) => {
  try {
    const stats = await Medecin.aggregate([
      {
        $group: {
          _id: '$specialite',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const statusStats = await Medecin.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalMedecins = await Medecin.countDocuments();
    const availableMedecins = await Medecin.countDocuments({ status: 'En service' });
    
    res.json({
      totalMedecins,
      availableMedecins,
      bySpeciality: stats,
      byStatus: statusStats
    });
  } catch (error) {
    console.error('Error fetching medecin stats:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
};

// Get rendez-vous statistics
export const getRendezVousStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const stats = await RendezVous.aggregate([
      {
        $match: {
          date: {
            $gte: startOfMonth,
            $lte: endOfMonth
          }
        }
      },
      {
        $group: {
          _id: '$statut',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalRendezVous = await RendezVous.countDocuments();
    const todayRendezVous = await RendezVous.countDocuments({
      date: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999))
      }
    });
    
    const thisMonthRendezVous = await RendezVous.countDocuments({
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    res.json({
      totalRendezVous,
      todayRendezVous,
      thisMonth: thisMonthRendezVous,
      thisMonthByStatus: stats
    });
  } catch (error) {
    console.error('Error fetching rendez-vous stats:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques', error: error.message });
  }
}; 