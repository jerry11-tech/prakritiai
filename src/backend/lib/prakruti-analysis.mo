import Types "../types/prakruti-analysis";
import List "mo:core/List";

module {
  public type AnalysisResult = Types.AnalysisResult;
  public type PrakrutiType = Types.PrakrutiType;
  public type DoshaScores = Types.DoshaScores;
  public type FacialConditions = Types.FacialConditions;

  public func getById(
    results : List.List<AnalysisResult>,
    id : Nat,
  ) : ?AnalysisResult {
    results.find(func(r) { r.id == id });
  };

  public func getLatest(
    results : List.List<AnalysisResult>,
  ) : ?AnalysisResult {
    results.last();
  };

  public func store(
    results : List.List<AnalysisResult>,
    nextId : Nat,
    prakruti : PrakrutiType,
    doshaScores : DoshaScores,
    confidence : Float,
    facialConditions : FacialConditions,
    questAnswers : [Text],
    timestamp : Int,
  ) : Nat {
    let entry : AnalysisResult = {
      id = nextId;
      prakruti;
      doshaScores;
      confidence;
      facialConditions;
      questAnswers;
      timestamp;
    };
    results.add(entry);
    nextId;
  };

  public func count(
    results : List.List<AnalysisResult>,
  ) : Nat {
    results.size();
  };
};
