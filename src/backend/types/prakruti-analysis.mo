module {
  public type PrakrutiType = {
    #Vata;
    #Pitta;
    #Kapha;
  };

  public type DoshaScores = {
    vata : Float;
    pitta : Float;
    kapha : Float;
  };

  public type FacialConditions = {
    faceShape : Text;
    darkCircles : Text;
    puffiness : Text;
    skinTone : Text;
  };

  public type AnalysisResult = {
    id : Nat;
    prakruti : PrakrutiType;
    doshaScores : DoshaScores;
    confidence : Float;
    facialConditions : FacialConditions;
    questAnswers : [Text];
    timestamp : Int;
  };
};
