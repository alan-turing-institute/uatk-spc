use enum_map::{enum_map, Enum, EnumMap};
use ndarray::{array, Array1};

use crate::Activity;

#[derive(Enum)]
pub enum SymptomStatus {
    Presymptomatic,
    Asymptomatic,
    Symptomatic,
}

/// Fields defined in
/// https://github.com/Urban-Analytics/RAMP-UA/blob/master/microsim/opencl/doc/model_design.md#params.
/// Values from
/// https://github.com/Urban-Analytics/RAMP-UA/blob/Ecotwins-withCommuting/coding/model/opencl/ramp/params.py.
pub struct Params {
    pub location_hazard_multipliers: EnumMap<Activity, f32>,
    pub individual_hazard_multipliers: EnumMap<SymptomStatus, f32>,

    pub symptomatic_multiplier: f32,
    pub exposed_scale: f32,
    pub exposed_shape: f32,
    pub presymptomatic_scale: f32,
    pub presymptomatic_shape: f32,
    pub infection_log_scale: f32,
    pub infection_mode: f32,
    // TODO This changes daily. Not used in this codebase anymore
    pub lockdown_multiplier: f32,

    pub mortality_probs: Array1<f32>,
    pub obesity_multipliers: Array1<f32>,
    pub symptomatic_probs: Array1<f32>,

    pub cvd_multiplier: f32,
    pub diabetes_multiplier: f32,
    pub bloodpressure_multiplier: f32,
    pub overweight_sympt_mplier: f32,
}

impl Params {
    pub fn new() -> Params {
        Params {
            location_hazard_multipliers: enum_map! {
                Activity::Retail => 0.0165,
                Activity::Nightclub => 0.0165,
                Activity::PrimarySchool => 0.0165,
                Activity::SecondarySchool =>  0.0165,
                Activity::Home => 0.0165,
                Activity::Work => 0.0,
            },
            individual_hazard_multipliers: enum_map! {
                SymptomStatus::Presymptomatic => 1.0,
                SymptomStatus::Asymptomatic => 0.75,
                SymptomStatus::Symptomatic => 1.0,
            },

            symptomatic_multiplier: 0.5,
            exposed_scale: 2.82,
            exposed_shape: 3.99,
            presymptomatic_scale: 2.45,
            presymptomatic_shape: 7.79,
            infection_log_scale: 0.35,
            infection_mode: 7.0,
            lockdown_multiplier: 1.0,

            mortality_probs: array![
                0.00, 0.0001, 0.0001, 0.0002, 0.0003, 0.0004, 0.0006, 0.0010, 0.0016, 0.0024,
                0.0038, 0.0060, 0.0094, 0.0147, 0.0231, 0.0361, 0.0566, 0.0886, 0.1737
            ],
            obesity_multipliers: array![1.0, 1.0, 1.0, 1.0],
            symptomatic_probs: array![0.21, 0.21, 0.45, 0.45, 0.45, 0.45, 0.45, 0.69, 0.69],

            cvd_multiplier: 1.0,
            diabetes_multiplier: 1.0,
            bloodpressure_multiplier: 1.0,
            overweight_sympt_mplier: 1.46,
        }
    }
}
