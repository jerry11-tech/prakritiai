import Types "../types/prakruti-analysis";
import Lib "../lib/prakruti-analysis";
import List "mo:core/List";
import Time "mo:core/Time";

mixin (
  results : List.List<Types.AnalysisResult>,
  nextId : { var value : Nat },
) {
  public query func getAnalysisById(id : Nat) : async ?Types.AnalysisResult {
    Lib.getById(results, id);
  };

  public query func getLatestAnalysis() : async ?Types.AnalysisResult {
    Lib.getLatest(results);
  };

  public func storeAnalysis(
    prakruti : Types.PrakrutiType,
    doshaScores : Types.DoshaScores,
    confidence : Float,
    facialConditions : Types.FacialConditions,
    questAnswers : [Text],
  ) : async Nat {
    let id = nextId.value;
    let _ = Lib.store(results, id, prakruti, doshaScores, confidence, facialConditions, questAnswers, Time.now());
    nextId.value += 1;
    id;
  };

  public query func getAnalysisCount() : async Nat {
    Lib.count(results);
  };
};
