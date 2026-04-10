import Types "types/prakruti-analysis";
import PrakrutiMixin "mixins/prakruti-analysis-api";
import List "mo:core/List";

actor {
  let analysisResults = List.empty<Types.AnalysisResult>();
  let analysisNextId = { var value : Nat = 0 };

  include PrakrutiMixin(analysisResults, analysisNextId);
};
