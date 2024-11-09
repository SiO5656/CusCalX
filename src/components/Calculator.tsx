"use client";

import React, { useState, useEffect } from "react";
import { evaluate } from "mathjs";
import { ArrowLeft } from "lucide-react";
import dynamic from 'next/dynamic';

const CalcButton = dynamic(() => import('./CalcButton'), { ssr: false });
const History = dynamic(() => import('./History'), { ssr: false });
const CustomFormulas = dynamic(() => import('./CustomFormulas'), { ssr: false });

import type { HistoryItem, CustomFormula } from "@/lib/types";

const VARIABLE_VALUES_KEY = "calculator_variable_values";
const MAX_DISPLAY_LINES = 5;

export default function Calculator() {
  const [showHistory, setShowHistory] = useState(false);
  const [showFormulas, setShowFormulas] = useState(false);
  const [selectedFormulaId, setSelectedFormulaId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [formulas, setFormulas] = useState<CustomFormula[]>([]);
  const [input, setInput] = useState("");
  const [displayLines, setDisplayLines] = useState<string[]>([]);
  const [result, setResult] = useState("");
  const [resultUnit, setResultUnit] = useState<string>("");
  const [isDegrees, setIsDegrees] = useState(true);
  const [previousAnswer, setPreviousAnswer] = useState<string | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(VARIABLE_VALUES_KEY);
      if (saved) {
        setVariableValues(JSON.parse(saved));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(VARIABLE_VALUES_KEY, JSON.stringify(variableValues));
    }
  }, [variableValues]);

  const handleClear = () => {
    setInput("");
    setResult("");
    setResultUnit("");
    setDisplayLines([]);
    setPreviousAnswer(null);
  };

  const calculate = (expression: string, customFormula?: CustomFormula) => {
    try {
      const processedExpression = expression.replace(/Ans/g, previousAnswer || "0");
      
      const calculatedResult = evaluate(processedExpression);
      const formattedResult = Number.isInteger(calculatedResult) 
        ? calculatedResult.toString()
        : Number(calculatedResult.toFixed(8)).toString();
      
      setDisplayLines(prev => {
        const newLines = [...prev, `${expression} = ${formattedResult}${customFormula?.resultUnit ? ` ${customFormula.resultUnit}` : ''}`];
        return newLines.slice(-MAX_DISPLAY_LINES);
      });
      
      setResult(formattedResult);
      setPreviousAnswer(formattedResult);
      
      if (customFormula?.resultUnit) {
        setResultUnit(customFormula.resultUnit);
      }
      
      setHistory(prev => [...prev, {
        expression: input || expression,
        result: formattedResult,
        unit: customFormula?.resultUnit,
        timestamp: new Date()
      }]);
      
      setShowFormulas(false);
      setSelectedFormulaId(null);
      setInput("");
    } catch (error) {
      console.error("Calculation error:", error);
      setResult("Error");
      setResultUnit("");
    }
  };

  const handleSaveFormula = (formula: CustomFormula) => {
    setFormulas(prev => {
      const index = prev.findIndex(f => f.id === formula.id);
      if (index >= 0) {
        const newFormulas = [...prev];
        newFormulas[index] = formula;
        return newFormulas;
      }
      return [...prev, formula];
    });
  };

  const handleDeleteFormula = (id: string) => {
    setFormulas(prev => prev.filter(f => f.id !== id));
    setVariableValues(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    if (selectedFormulaId === id) {
      setSelectedFormulaId(null);
    }
  };

  const handleUseFormula = (formula: CustomFormula) => {
    setInput(formula.formula);
    calculate(formula.formula, formula);
  };

  const handleVariableValueChange = (formulaId: string, variableId: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [formulaId]: {
        ...(prev[formulaId] || {}),
        [variableId]: value
      }
    }));
  };

  const handleSelectFormula = (formulaId: string) => {
    setSelectedFormulaId(formulaId);
  };

  const handleBackToFormulas = () => {
    setSelectedFormulaId(null);
  };

  return (
    <div className="relative">
      <CalcButton
        input={input}
        setInput={setInput}
        result={result}
        setResult={setResult}
        calculate={calculate}
        isDegrees={isDegrees}
        setIsDegrees={setIsDegrees}
        resultUnit={resultUnit}
        onClear={handleClear}
        displayLines={displayLines}
        previousAnswer={previousAnswer}
        onToggleFormulas={() => setShowFormulas(!showFormulas)}
        onToggleHistory={() => setShowHistory(!showHistory)}
      />

      {showHistory && (
        <div className="absolute top-0 right-0 w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl p-3 sm:p-4 z-10 border border-gray-200 dark:border-slate-700">
          <History
            history={history}
            setInput={setInput}
            setResult={setResult}
            setShowHistory={setShowHistory}
            setHistory={setHistory}
          />
        </div>
      )}

      {showFormulas && (
        <div className="absolute top-0 right-0 w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-xl p-3 sm:p-4 z-10 border border-gray-200 dark:border-slate-700">
          {selectedFormulaId ? (
            <div>
              <button
                onClick={handleBackToFormulas}
                className="flex items-center gap-1 text-indigo-500 hover:text-indigo-600 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                戻る
              </button>
              <CustomFormulas
                formulas={formulas.filter(f => f.id === selectedFormulaId)}
                onSaveFormula={handleSaveFormula}
                onDeleteFormula={handleDeleteFormula}
                onUseFormula={handleUseFormula}
                variableValues={variableValues}
                onVariableValueChange={handleVariableValueChange}
                onSelectFormula={handleSelectFormula}
                selectedFormulaId={selectedFormulaId}
              />
            </div>
          ) : (
            <CustomFormulas
              formulas={formulas}
              onSaveFormula={handleSaveFormula}
              onDeleteFormula={handleDeleteFormula}
              onUseFormula={handleUseFormula}
              variableValues={variableValues}
              onVariableValueChange={handleVariableValueChange}
              onSelectFormula={handleSelectFormula}
              selectedFormulaId={selectedFormulaId}
            />
          )}
        </div>
      )}
    </div>
  );
}